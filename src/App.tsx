import {
	Badge,
	Box,
	Button,
	Divider,
	Flex,
	Heading,
	HStack,
	Text,
	VStack,
} from "@chakra-ui/react";
//@ts-ignore
import ColorHash from "color-hash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { WebrtcProvider } from "y-webrtc";
import { Array as YArray, Doc, UndoManager } from "yjs";
import CheckboxRow from "./components/CheckboxRow";
import CreateTodoForm from "./components/CreateTodoForm";
import UndoRedoButtons from "./components/UndoRedoButtons";

interface Todo {
	title: string;
	completed: boolean;
}

const signalingServer = "wss://signaling.yjs.dev";
const password = "das8duajsdnasd9asdj932ej2j9edass";
const room = "yjs-demo-room-e3i12i31joi3ho12i3ho12i3jo12i";

function App() {
	// --------------------------------------------------------------------------------------------- //

	/**
	 * Create provider and initialize YDoc.
	 */

	// Create the shared type and provider but do not connect to the provider.
	const [sharedTodos, undoManager, provider] = useMemo(() => {
		// Create a YJS document
		const doc = new Doc();

		/**
		 * A YJS `Array` type of todos, to be shared across states.
		 */
		const sharedTodos: YArray<Todo> = doc.getArray("todos");

		/**
		 * A YJS `UndoManaager` capable of transmitting undo and redo events to the shared state.
		 */
		const undoManager = new UndoManager(sharedTodos);

		// Define a provider
		const provider = new WebrtcProvider(room, doc, {
			signaling: [signalingServer],
			password: password,
			peerOpts: {},
		});
		provider.shouldConnect = true;
		return [sharedTodos, undoManager, provider];
	}, []);

	// --------------------------------------------------------------------------------------------- //

	/**
	 * Define ourselves to the awareness protocol, then listen to it.
	 */

	const declareSelf = useCallback(
		() =>
			provider?.awareness.setLocalState({
				clientID: provider.awareness.clientID,
			}),
		[provider.awareness]
	);

	useEffect(() => {
		declareSelf();
	}, [declareSelf, provider]);

	const [awareness, setAwareness] = useState<
		{ [x: string]: any }[] | undefined
	>();

	useEffect(() => {
		provider?.awareness.on("update", () => {
			setAwareness(Array.from(provider.awareness.getStates().values()));
		});
	}, [provider]);

	// --------------------------------------------------------------------------------------------- //

	/**
	 * Observe state from shared state for display.
	 */

	const [todos, setTodos] = useState<Todo[]>([]);

	useEffect(() => {
		// Create observer that transmits changes in shared state to react state for display.
		const listObserver = () => {
			setTodos(sharedTodos.toArray());
		};

		sharedTodos.observeDeep(listObserver);

		return () => sharedTodos.unobserveDeep(listObserver);
	}, [sharedTodos]);

	// --------------------------------------------------------------------------------------------- //

	const [inputValue, setInputValue] = useState("");
	const [loading, setLoading] = useState(false);
	const colorHash = new ColorHash();

	return (
		<Box w="100%">
			<Heading as={"h1"} fontSize="2xl" textAlign="center" my="2rem">
				Simple YJS demo
			</Heading>
			<Flex direction="row" w="60rem" mx="auto" wrap={"wrap"} maxW="100%">
				{/* Left side */}
				<Flex
					direction="column"
					p="2rem"
					gap="1.5rem"
					flexGrow={1}
					bg="gray.50"
					maxH="fit-content"
					minW="25rem"
				>
					<Flex
						direction="row"
						justify="space-between"
						align="center"
					>
						<Text>
							Connected: {provider.connected ? "yes" : "no"}
						</Text>
						<Button
							size="sm"
							colorScheme={provider.connected ? "red" : "blue"}
							isLoading={loading}
							onClick={() => {
								setLoading(true);
								provider.connected
									? provider.disconnect()
									: provider.connect();

								if (!provider.connected) {
									declareSelf();
								} else {
									setAwareness([]);
								}

								setTimeout(() => {
									setLoading(false);
								}, 500);
							}}
						>
							{provider.connected ? "Disconnect" : "Connect"}
						</Button>
					</Flex>

					<Divider />
					{provider.connected && (
						<VStack align="left">
							<Heading size="sm" mb={2}>
								Clients online:
							</Heading>
							{awareness?.map((el) => (
								<HStack key={"Clients: " + el?.clientID}>
									<Text
										color={colorHash.hex(
											el?.clientID.toString()
										)}
									>
										{el?.clientID}
									</Text>
									<Badge>
										{el?.clientID ===
											provider.awareness?.clientID &&
											"You"}
									</Badge>
								</HStack>
							))}
						</VStack>
					)}
				</Flex>

				{/* Right side */}
				<Flex
					direction="column"
					flexGrow={1}
					p="2rem"
					gap="1.5rem"
					minW="25rem"
				>
					<CreateTodoForm
						inputValue={inputValue}
						setInputValue={setInputValue}
						onSubmit={(e) => {
							e.preventDefault();
							sharedTodos.push([
								{ completed: false, title: inputValue },
							]);
							undoManager.stopCapturing();
							setInputValue("");
						}}
					/>
					<UndoRedoButtons
						onUndo={() => undoManager.undo()}
						onRedo={() => undoManager.redo()}
					/>
					<Divider />
					<Flex direction="column">
						{todos.map((todo, index) => (
							<CheckboxRow
								key={`Todo_${index}`}
								isChecked={todos[index].completed}
								onChange={(e) => {
									// Transact to bundle two chaanges into one update.
									sharedTodos.doc?.transact(() => {
										sharedTodos.insert(index, [
											{
												...sharedTodos.get(index),
												completed: e.target.checked,
											},
										]);
										sharedTodos.delete(index + 1, 1);
									});
									undoManager.stopCapturing();
								}}
								onDelete={() => {
									sharedTodos.delete(index);
									undoManager.stopCapturing();
								}}
							>
								{todo.title}
							</CheckboxRow>
						))}
					</Flex>
				</Flex>
			</Flex>
		</Box>
	);
}

export default App;
