package com.example.demo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AiService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private static final String OPENROUTER_API_URL =
            "https://openrouter.ai/api/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Sends a prompt to OpenRouter and returns the generated response.
     */
    public String generateTests(String prompt) {

        try {

            HttpHeaders headers = new HttpHeaders();

            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            headers.set(
                    "HTTP-Referer",
                    "http://localhost:8081"
            );

            headers.set(
                    "X-Title",
                    "Automated Software Quality Monitor"
            );

            Map<String, Object> requestBody =
                    new HashMap<>();

            /*
             * OpenRouter automatically selects
             * an available model.
             */
            requestBody.put(
                    "model",
                    "openrouter/free"
            );

            List<Map<String, String>> messages =
                    new ArrayList<>();

            Map<String, String> userMessage =
                    new HashMap<>();

            userMessage.put(
                    "role",
                    "user"
            );

            userMessage.put(
                    "content",
                    prompt
            );

            messages.add(userMessage);

            requestBody.put(
                    "messages",
                    messages
            );

            HttpEntity<Map<String, Object>> request =
                    new HttpEntity<>(
                            requestBody,
                            headers
                    );

            ResponseEntity<String> response =
                    restTemplate.postForEntity(
                            OPENROUTER_API_URL,
                            request,
                            String.class
                    );

            if (!response.getStatusCode().is2xxSuccessful()) {

                return "Error: OpenRouter returned HTTP "
                        + response.getStatusCode().value();
            }

            if (response.getBody() == null
                    || response.getBody().isEmpty()) {

                return "Error: Empty response received from OpenRouter.";
            }

            JsonNode root =
                    objectMapper.readTree(
                            response.getBody()
                    );

            JsonNode choices =
                    root.path("choices");

            if (!choices.isArray()
                    || choices.isEmpty()) {

                return "Error: No AI response was generated.";
            }

            JsonNode message =
                    choices.get(0)
                            .path("message");

            JsonNode content =
                    message.path("content");

            if (content.isMissingNode()
                    || content.isNull()) {

                return "Error: AI response content was empty.";
            }

            return content.asText();

        } catch (Exception e) {

            System.err.println(
                    "OpenRouter API Connection Error: "
                            + e.getMessage()
            );

            e.printStackTrace();

            return "Error: API connection failed. "
                    + "Check Spring Boot terminal for details.";
        }
    }
}