// RNTL v14: render is async — always await it.
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

test("renders text", async () => {
  await render(<Text>hi</Text>);
  expect(screen.getByText("hi")).toBeOnTheScreen();
});
