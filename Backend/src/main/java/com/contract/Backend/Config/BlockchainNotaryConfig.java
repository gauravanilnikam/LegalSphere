package com.contract.Backend.Config;

import lombok.Data;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;

@Configuration
@EnableConfigurationProperties(BlockchainNotaryConfig.BlockchainNotaryProperties.class)
public class BlockchainNotaryConfig {

    @Bean
    @ConditionalOnProperty(prefix = "blockchain.notary", name = "enabled", havingValue = "true")
    public Web3j web3j(BlockchainNotaryProperties properties) {
        return Web3j.build(new HttpService(properties.getRpcUrl()));
    }

    @Bean
    @ConditionalOnProperty(prefix = "blockchain.notary", name = "enabled", havingValue = "true")
    public Credentials notaryCredentials(BlockchainNotaryProperties properties) {
        return Credentials.create(properties.getPrivateKey());
    }

    @Data
    @ConfigurationProperties(prefix = "blockchain.notary")
    public static class BlockchainNotaryProperties {
        private boolean enabled = false;
        private String rpcUrl;
        private long chainId = 11155111L;
        private String privateKey;
        private String toAddress;
        private long gasLimit = 100000L;
        private long pollIntervalMs = 1000L;
        private int receiptAttempts = 45;
    }
}

