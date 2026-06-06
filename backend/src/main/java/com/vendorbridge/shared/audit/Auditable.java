package com.vendorbridge.shared.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {

    /**
     * Describes the action being audited.
     * Example: "CREATE_VENDOR", "UPDATE_RFQ", "APPROVE_QUOTATION"
     */
    String action();
}
