export declare const testUsers: {
    validFarmer: {
        phoneNumber: string;
        password: string;
        role: string;
        fullName: string;
        email: string;
        preferredLanguage: string;
    };
    validBuyer: {
        phoneNumber: string;
        password: string;
        role: string;
        fullName: string;
        email: string;
        preferredLanguage: string;
    };
    minimalUser: {
        phoneNumber: string;
        password: string;
    };
    invalidRole: {
        phoneNumber: string;
        password: string;
        role: string;
    };
    missingPhone: {
        password: string;
        role: string;
    };
    missingPassword: {
        phoneNumber: string;
        role: string;
    };
};
export declare const loginAttempts: {
    validCredentials: {
        phoneNumber: string;
        password: string;
    };
    wrongPassword: {
        phoneNumber: string;
        password: string;
    };
    nonExistentUser: {
        phoneNumber: string;
        password: string;
    };
    missingPhone: {
        password: string;
    };
    missingPassword: {
        phoneNumber: string;
    };
};
export declare const httpStatus: {
    OK: number;
    CREATED: number;
    BAD_REQUEST: number;
    UNAUTHORIZED: number;
    CONFLICT: number;
};
//# sourceMappingURL=testData.d.ts.map