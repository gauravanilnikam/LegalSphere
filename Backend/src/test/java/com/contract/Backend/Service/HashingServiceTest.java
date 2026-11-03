package com.contract.Backend.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HashingServiceTest {

    @Test
    void canonicalJsonUtf8Bytes_producesSameHashForDifferentKeyOrder() {
        HashingService hashingService = new HashingService(new ObjectMapper());

        String jsonA = "{\"b\":2,\"a\":1}";
        String jsonB = "{\"a\":1,\"b\":2}";

        String hashA = hashingService.sha256Hex(hashingService.canonicalJsonUtf8Bytes(jsonA));
        String hashB = hashingService.sha256Hex(hashingService.canonicalJsonUtf8Bytes(jsonB));

        assertEquals(hashA, hashB);
    }
}

