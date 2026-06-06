package com.vendorbridge.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String EXCHANGE_NAME = "vendorbridge.events";

    public static final String NOTIFICATION_EMAIL_QUEUE = "notification.email";
    public static final String NOTIFICATION_EMAIL_ROUTING_KEY = "event.notification.*";

    public static final String AUDIT_LOG_QUEUE = "audit.log";
    public static final String AUDIT_LOG_ROUTING_KEY = "event.audit.*";

    @Bean
    public TopicExchange vendorbridgeExchange() {
        return new TopicExchange(EXCHANGE_NAME, true, false);
    }

    @Bean
    public Queue notificationEmailQueue() {
        return QueueBuilder.durable(NOTIFICATION_EMAIL_QUEUE)
                .withArgument("x-dead-letter-exchange", EXCHANGE_NAME + ".dlx")
                .withArgument("x-dead-letter-routing-key", "dlq.notification.email")
                .build();
    }

    @Bean
    public Queue auditLogQueue() {
        return QueueBuilder.durable(AUDIT_LOG_QUEUE)
                .withArgument("x-dead-letter-exchange", EXCHANGE_NAME + ".dlx")
                .withArgument("x-dead-letter-routing-key", "dlq.audit.log")
                .build();
    }

    @Bean
    public Binding notificationEmailBinding(Queue notificationEmailQueue, TopicExchange vendorbridgeExchange) {
        return BindingBuilder.bind(notificationEmailQueue)
                .to(vendorbridgeExchange)
                .with(NOTIFICATION_EMAIL_ROUTING_KEY);
    }

    @Bean
    public Binding auditLogBinding(Queue auditLogQueue, TopicExchange vendorbridgeExchange) {
        return BindingBuilder.bind(auditLogQueue)
                .to(vendorbridgeExchange)
                .with(AUDIT_LOG_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jackson2JsonMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                         MessageConverter jackson2JsonMessageConverter) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jackson2JsonMessageConverter);
        rabbitTemplate.setExchange(EXCHANGE_NAME);
        return rabbitTemplate;
    }
}
