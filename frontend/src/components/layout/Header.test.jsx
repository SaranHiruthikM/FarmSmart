import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import authService from "../../services/auth.service";

// Mock dependencies
vi.mock("../../services/auth.service", () => ({
    default: {
        getCurrentUser: vi.fn(),
        logout: vi.fn(),
    },
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe("Header Component", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders correctly with user data", () => {
        authService.getCurrentUser.mockReturnValue({
            fullName: "Test Farmer",
            phoneNumber: "1234567890",
        });

        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        // Initial render might just show the avatar/search
        // We expect the profile button/image to be there
        const profileImage = screen.getByAltText("User");
        expect(profileImage).toBeInTheDocument();
    });

    it("opens profile menu and logs out correctly", () => {
        authService.getCurrentUser.mockReturnValue({
            fullName: "Test Farmer",
            phoneNumber: "1234567890",
        });

        render(
            <MemoryRouter>
                <Header />
            </MemoryRouter>
        );

        // Click profile to open menu
        const profileButton = screen.getByAltText("User").closest("button");
        fireEvent.click(profileButton);

        // Check if name is displayed in dropdown
        expect(screen.getByText("Test Farmer")).toBeInTheDocument();

        // Click logout
        const logoutButton = screen.getByText("Logout");
        fireEvent.click(logoutButton);

        expect(authService.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });
});
