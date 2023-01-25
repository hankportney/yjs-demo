import { Button, ButtonGroup } from "@chakra-ui/react";
import { FC } from "react";

interface UndoRedoButtonProps {
	onUndo: () => void;
	onRedo: () => void;
}

const UndoRedoButtons: FC<UndoRedoButtonProps> = ({ onUndo, onRedo }) => {
	return (
		<ButtonGroup w="100%" size="sm">
			<Button flexGrow={1} onClick={onUndo}>
				Undo
			</Button>
			<Button flexGrow={1} onClick={onRedo}>
				Redo
			</Button>
		</ButtonGroup>
	);
};
export default UndoRedoButtons;
