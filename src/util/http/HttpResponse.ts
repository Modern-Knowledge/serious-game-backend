/*
 * Copyright (c) 2019 Florian Mold
 * All rights reserved.
 */

/**
 * https://github.com/omniti-labs/jsend
 */
export class HttpResponse {
    private readonly status: HttpResponseStatus;
    private readonly data?: any;
    private readonly messages?: HttpResponseMessage[];
    private readonly version: string = process.env.VERSION;

    /**
     * @param status
     * @param data
     * @param messages
     */
    public constructor(status: HttpResponseStatus, data?: any, messages?: HttpResponseMessage[]) {
        this.status = status;

        if (data) {
            this.data = data;
        } else {
            this.data = undefined;
        }

        this.messages = messages;
    }
}

export const enum HttpResponseStatus {
    SUCCESS = "success",
    FAIL = "fail",
    ERROR = "error"
}

export class HttpResponseMessage {
    private readonly severity: HttpResponseMessageSeverity;
    private readonly message: string;

    /**
     * @param severity
     * @param message
     */
    public constructor(severity: HttpResponseMessageSeverity, message: string) {
        this.severity = severity;
        this.message = message;
    }
}

export const enum HttpResponseMessageSeverity {
    SUCCESS = "success",
    WARNING = "warning",
    DANGER = "danger",
    INFO = "primary"
}