import { Button, Flex, FormControl, Input, Tooltip } from "@chakra-ui/react";
import { Dispatch, FC, SetStateAction } from "react";

interface CreateTodoFormProps {
	onSubmit: React.FormEventHandler<HTMLDivElement>;
	inputValue: string;
	setInputValue: Dispatch<SetStateAction<string>>;
}

const CreateTodoForm: FC<CreateTodoFormProps> = ({
	onSubmit,
	inputValue,
	setInputValue,
}) => {
	return (
		<Flex as="form" onSubmit={onSubmit} direction="column" gap="1rem">
			<FormControl isRequired>
				<Input
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					placeholder="Enter a todo list item"
				/>
			</FormControl>

			<Tooltip
				label={
					inputValue.trim() === ""
						? "Enter item text to continue."
						: "Create a todo item."
				}
				hasArrow
				shouldWrapChildren={inputValue.trim() === ""}
			>
				<Button
					w="100%"
					colorScheme="blue"
					type="submit"
					isDisabled={inputValue.trim() === ""}
				>
					Create todo list item
				</Button>
			</Tooltip>
		</Flex>
	);
};

export default CreateTodoForm;
