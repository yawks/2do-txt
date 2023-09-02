import { Kbd } from "@/components/Kbd";
import { useConfirmationDialogStore } from "@/stores/confirmation-dialog-store";
import { useTaskDialogStore } from "@/stores/task-dialog-store";
import { Task } from "@/utils/task";
import { useTask } from "@/utils/useTask";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import {
  Box,
  ClickAwayListener,
  Grow,
  IconButton,
  MenuItem,
  MenuList,
  Paper,
  Popper,
  styled,
} from "@mui/material";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

const ListIconButton = styled(IconButton)({
  padding: 9, // use the same padding as the checkbox on the opposite side
});

interface TaskListItemMenuProps {
  task: Task;
  menuRef: MutableRefObject<HTMLUListElement | null>;
  menuButtonRef: MutableRefObject<HTMLButtonElement | null>;
}

export function TaskListItemMenu(props: TaskListItemMenuProps) {
  const { task, menuRef, menuButtonRef } = props;
  const { t } = useTranslation();
  const { deleteTask } = useTask();
  const openConfirmationDialog = useConfirmationDialogStore(
    (state) => state.openConfirmationDialog,
  );
  const [open, setOpen] = useState(false);
  const openTaskDialog = useTaskDialogStore((state) => state.openTaskDialog);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleEdit = () => {
    handleClose();
    openTaskDialog(task);
  };

  const handleDelete = () => {
    handleClose();
    openConfirmationDialog({
      title: t("Delete task"),
      content: t("Are you sure you want to delete this task?"),
      buttons: [
        {
          text: t("Cancel"),
        },
        {
          text: t("Delete"),
          handler: () => {
            deleteTask(task);
          },
        },
      ],
    });
  };

  const handleClose = (event?: any) => {
    if (
      event &&
      menuButtonRef.current &&
      menuButtonRef.current.contains(event.target)
    ) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event: any) => {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = useRef(open);
  useEffect(() => {
    if (menuButtonRef.current && prevOpen.current && !open) {
      menuButtonRef.current.focus();
    }
    prevOpen.current = open;
  }, [menuButtonRef, open]);

  return (
    <>
      <ListIconButton
        ref={menuButtonRef}
        aria-label="Task menu"
        aria-controls={open ? "composition-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        tabIndex={-1}
        edge="end"
      >
        <MoreHorizIcon />
      </ListIconButton>
      <Popper
        open={open}
        anchorEl={menuButtonRef.current}
        role={undefined}
        placement="bottom-end"
        transition
        style={{ zIndex: 1 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  onKeyDown={handleListKeyDown}
                  ref={menuRef}
                >
                  <MenuItem onClick={handleEdit} aria-label="Edit task">
                    <Box sx={{ display: "flex", width: "100%" }}>
                      <Box sx={{ flex: 1, mr: 2 }}>{t("Edit")}</Box>
                      <Kbd>E</Kbd>
                    </Box>
                  </MenuItem>
                  <MenuItem onClick={handleDelete} aria-label="Delete task">
                    <Box sx={{ display: "flex", width: "100%" }}>
                      <Box sx={{ flex: 1, mr: 2 }}>{t("Delete")}</Box>
                      <Kbd>D</Kbd>
                    </Box>
                  </MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}
