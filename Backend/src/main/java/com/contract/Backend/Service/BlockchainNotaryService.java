package com.contract.Backend.Service;

import com.contract.Backend.Config.BlockchainNotaryConfig.BlockchainNotaryProperties;
import com.contract.Backend.Repository.ContractDraftRepository;
import com.contract.Backend.model.ContractDraft;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.methods.response.EthBlock;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tx.RawTransactionManager;
import org.web3j.tx.response.PollingTransactionReceiptProcessor;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BlockchainNotaryService {

    private final BlockchainNotaryProperties properties;
    private final ObjectProvider<Web3j> web3jProvider;
    private final ObjectProvider<Credentials> credentialsProvider;
    private final ContractDraftRepository draftRepository;
    private final ObjectMapper objectMapper;

    public ContractDraft notarizeDraft(ContractDraft draft) {
        if (!properties.isEnabled()) {
            if (draft.getNotarizationStatus() != ContractDraft.NotarizationStatus.DISABLED) {
                draft.setNotarizationStatus(ContractDraft.NotarizationStatus.DISABLED);
                draft.setNotaryError(null);
            }
            if (draft.getId() != null) {
                return draftRepository.save(draft);
            }
            return draft;
        }

        Web3j web3j = web3jProvider.getIfAvailable();
        Credentials credentials = credentialsProvider.getIfAvailable();
        if (web3j == null || credentials == null) {
            draft.setNotarizationStatus(ContractDraft.NotarizationStatus.FAILED);
            draft.setNotaryError("Blockchain notary is enabled but Web3j/Credentials are not configured");
            return draftRepository.save(draft);
        }

        try {
            String payloadJson = buildPayloadJson(draft);
            String data = Numeric.toHexString(payloadJson.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            String toAddress = (properties.getToAddress() == null || properties.getToAddress().isBlank())
                    ? credentials.getAddress()
                    : properties.getToAddress();

            BigInteger gasPrice = web3j.ethGasPrice().send().getGasPrice();
            BigInteger gasLimit = BigInteger.valueOf(properties.getGasLimit());

            PollingTransactionReceiptProcessor receiptProcessor =
                    new PollingTransactionReceiptProcessor(web3j, properties.getPollIntervalMs(), properties.getReceiptAttempts());
            RawTransactionManager txManager =
                    new RawTransactionManager(web3j, credentials, properties.getChainId(), receiptProcessor);

            String txHash = txManager.sendTransaction(gasPrice, gasLimit, toAddress, data, BigInteger.ZERO).getTransactionHash();
            if (txHash == null || txHash.isBlank()) {
                draft.setNotarizationStatus(ContractDraft.NotarizationStatus.FAILED);
                draft.setNotaryError("Transaction submission failed: no transaction hash returned");
                return draftRepository.save(draft);
            }

            draft.setNotarizationStatus(ContractDraft.NotarizationStatus.SUBMITTED);
            draft.setNotaryTxHash(txHash);
            draft.setNotaryError(null);
            draftRepository.save(draft);

            TransactionReceipt receipt = receiptProcessor.waitForTransactionReceipt(txHash);
            if (receipt.getBlockNumber() != null) {
                draft.setNotaryBlockNumber(receipt.getBlockNumber().longValue());
            }

            if (receipt.getBlockHash() != null) {
                EthBlock block = web3j.ethGetBlockByHash(receipt.getBlockHash(), false).send();
                if (block != null && block.getBlock() != null && block.getBlock().getTimestamp() != null) {
                    Instant blockTime = Instant.ofEpochSecond(block.getBlock().getTimestamp().longValue());
                    draft.setNotaryBlockTimestamp(LocalDateTime.ofInstant(blockTime, ZoneOffset.UTC));
                }
            }

            draft.setNotarizationStatus(ContractDraft.NotarizationStatus.CONFIRMED);
            return draftRepository.save(draft);
        } catch (Exception e) {
            draft.setNotarizationStatus(ContractDraft.NotarizationStatus.FAILED);
            draft.setNotaryError(safeMessage(e));
            return draftRepository.save(draft);
        }
    }

    private String buildPayloadJson(ContractDraft draft) throws JsonProcessingException {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("type", "contract_draft");
        payload.put("id", draft.getId() != null ? draft.getId().toString() : null);
        payload.put("version", draft.getVersion());
        payload.put("contentSha256", draft.getContentSha256());
        payload.put("docxSha256", draft.getDocxSha256());
        payload.put("createdAt", draft.getCreatedAt() != null ? draft.getCreatedAt().toString() : null);
        return objectMapper.writeValueAsString(payload);
    }

    private static String safeMessage(Exception e) {
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            return e.getClass().getSimpleName();
        }
        if (msg.length() > 950) {
            return msg.substring(0, 950);
        }
        return msg;
    }
}
