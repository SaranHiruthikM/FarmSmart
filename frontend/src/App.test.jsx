import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("Simple Test", () => {
    it("renders a div", () => {
        render(<div>Hello Test World</div>);
        expect(screen.getByText("Hello Test World")).toBeInTheDocument();
    });
});
