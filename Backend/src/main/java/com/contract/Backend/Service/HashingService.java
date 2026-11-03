package com.contract.Backend.Service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
@RequiredArgsConstructor
public class HashingService {

    private final ObjectMapper objectMapper;

    public String sha256Hex(byte[] bytes) {
        MessageDigest digest = sha256Digest();
        byte[] hash = digest.digest(bytes);
        return toHex(hash);
    }

    public String sha256HexUtf8(String value) {
        return sha256Hex(value.getBytes(StandardCharsets.UTF_8));
    }

    public byte[] canonicalJsonUtf8Bytes(String json) {
        if (json == null) {
            return new byte[0];
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            ObjectMapper canonicalMapper = objectMapper.copy();
            canonicalMapper.configure(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS, true);
            canonicalMapper.configure(SerializationFeature.INDENT_OUTPUT, false);
            return canonicalMapper.writeValueAsBytes(node);
        } catch (JsonProcessingException ignored) {
            return json.getBytes(StandardCharsets.UTF_8);
        }
    }

    private static MessageDigest sha256Digest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not supported", e);
        }
    }

    private static String toHex(byte[] bytes) {
        char[] hexArray = "0123456789abcdef".toCharArray();
        char[] hexChars = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            hexChars[i * 2] = hexArray[v >>> 4];
            hexChars[i * 2 + 1] = hexArray[v & 0x0F];
        }
        return new String(hexChars);
    }
}

