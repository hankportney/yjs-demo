import { DeleteIcon } from "@chakra-ui/icons";
import { Checkbox, Flex, IconButton, Text } from "@chakra-ui/react";
import { FC, ReactNode } from "react";

interface CheckboxRowProps {
	isChecked: boolean;
	onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
	onDelete: () => void;
	children: ReactNode;
}

const CheckboxRow: FC<CheckboxRowProps> = ({
	isChecked,
	onChange,
	onDelete,
	children,
}) => {
	return (
		<Flex
			align="center"
			justify="space-between"
			pl="0.5rem"
			pr="0.25rem"
			h="2.5rem"
			_hover={{ bg: "gray.100" }}
		>
			<Checkbox
				h="100%"
				flexGrow={1}
				minW={0}
				display="flex"
				flexDirection="row"
				alignItems="center"
				cursor="pointer"
				isChecked={isChecked}
				onChange={onChange}
				__css={{
					".chakra-checkbox__label": {
						flexGrow: 1,
						minWidth: 0,
					},
				}}
			>
				<Text noOfLines={1} flexGrow={1} minW={0}>
					{children}
				</Text>
			</Checkbox>
			<IconButton
				size="sm"
				variant="ghost"
				icon={<DeleteIcon />}
				colorScheme="red"
				aria-label={`Delete todo list item`}
				onClick={onDelete}
			/>
		</Flex>
	);
};

export default CheckboxRow;
