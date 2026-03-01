import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import authService from "../services/auth.service";

// Mock dependencies
vi.mock("../services/auth.service", () => ({
    default: {
        login: vi.fn(),
    },
}));

// Mock LanguageSelector since it might use i18n hooks we didn't setup deeply
vi.mock("../components/common/LanguageSelector", () => ({
    default: () => <div data-testid="language-selector">Language Selector</div>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("Login Page", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders login form correctly", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByPlaceholderText("Enter your phone number")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /Sign In/i })).toBeInTheDocument();
    });

    it("updates input fields", () => {
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const phoneInput = screen.getByPlaceholderText("Enter your phone number");
        const passwordInput = screen.getByPlaceholderText("••••••••");

        fireEvent.change(phoneInput, { target: { value: "9876543210" } });
        fireEvent.change(passwordInput, { target: { value: "password123" } });

        expect(phoneInput.value).toBe("9876543210");
        expect(passwordInput.value).toBe("password123");
    });

    it("calls login service and navigates to OTP on success", async () => {
        authService.login.mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
            target: { value: "9876543210" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "password123" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

        await waitFor(() => {
            expect(authService.login).toHaveBeenCalledWith({
                phoneNumber: "9876543210",
                password: "password123",
            });
            expect(mockNavigate).toHaveBeenCalledWith("/otp", {
                state: { phoneNumber: "9876543210" },
            });
        });
    });

    it("displays error message on login failure", async () => {
        const errorMessage = "Invalid credentials";
        authService.login.mockRejectedValue({
            response: { data: { message: errorMessage } },
        });

        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
            target: { value: "9876543210" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "wrongpassword" },
        });

        fireEvent.click(screen.getByRole("button", { name: /Sign In/i }));

        await waitFor(() => {
            expect(screen.getByText(errorMessage)).toBeInTheDocument();
        });
    });
});
