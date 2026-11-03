package com.contract.Backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestClient;

import java.util.List;

@Configuration
public class OllamaConfig {

    @Bean
    public RestClient.Builder ollamaRestClientBuilder(List<MappingJackson2HttpMessageConverter> converters) {
        return RestClient.builder()
                .messageConverters(converterList -> {
                    converterList.add(new MappingJackson2HttpMessageConverter());
                    // Add a converter that can handle text/plain content
                    MappingJackson2HttpMessageConverter textJsonConverter = new MappingJackson2HttpMessageConverter();
                    textJsonConverter.setSupportedMediaTypes(List.of(
                            org.springframework.http.MediaType.TEXT_PLAIN,
                            org.springframework.http.MediaType.APPLICATION_JSON
                    ));
                    converterList.add(textJsonConverter);
                });
    }
}