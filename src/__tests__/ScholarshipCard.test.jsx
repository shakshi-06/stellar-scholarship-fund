import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScholarshipCard from "../components/ScholarshipCard";

// Mock wallet context
vi.mock("../context/WalletContext", () => ({
  useWallet: () => ({ publicKey: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM" }),
}));

const mockScholarship = {
  id: 1,
  name: "Test Student Scholarship",
  firstName: "Test",
  description: "A test scholarship description.",
  field: "Computer Science",
  location: "Kolkata, WB",
  goal: 500,
  raised: 250,
  daysLeft: 10,
  emoji: "👩‍💻",
  color: "#FFB347",
  walletAddress: "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3MED226GEM",
};

describe("ScholarshipCard", () => {
  it("renders student name", () => {
    render(<ScholarshipCard scholarship={mockScholarship} onDonate={() => {}} />);
    expect(screen.getByText("Test Student Scholarship")).toBeInTheDocument();
  });

  it("displays correct progress percentage", () => {
    render(<ScholarshipCard scholarship={mockScholarship} onDonate={() => {}} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("shows raised amount", () => {
    render(<ScholarshipCard scholarship={mockScholarship} onDonate={() => {}} />);
expect(screen.getByText(/raised/)).toBeInTheDocument();  });

  it("calls onDonate when button is clicked", () => {
    const onDonate = vi.fn();
    render(<ScholarshipCard scholarship={mockScholarship} onDonate={onDonate} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(onDonate).toHaveBeenCalledWith(mockScholarship);
  });

  it("shows days left", () => {
    render(<ScholarshipCard scholarship={mockScholarship} onDonate={() => {}} />);
    expect(screen.getByText("10d left")).toBeInTheDocument();
  });
});
