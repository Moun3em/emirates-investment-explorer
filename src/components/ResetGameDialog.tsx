import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface ResetGameDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const ResetGameDialog = ({
	isOpen,
	onClose,
	onConfirm,
}: ResetGameDialogProps) => {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-destructive">
						<AlertTriangle className="h-5 w-5" />
						Reset Game
					</DialogTitle>
					<DialogDescription>
						Are you sure you want to reset the game? All progress
						will be lost.
					</DialogDescription>
				</DialogHeader>
				<div className="flex justify-end space-x-2 pt-4">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm}>
						Reset Game
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ResetGameDialog;
