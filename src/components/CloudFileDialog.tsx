import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  CircularProgress,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import React, { useCallback, useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  cloudStorageIconsDisabled,
  useCloudStorage,
} from "../data/CloudStorageContext";
import { useFilter } from "../data/FilterContext";
import { useTask } from "../data/TaskContext";
import {
  CloudFile,
  CloudFileRef,
  ListCloudItemResult,
} from "../types/cloud-storage.types";
import { ResponsiveDialog } from "./ResponsiveDialog";
import StartEllipsis from "./StartEllipsis";

const root = "";

const CloudFileDialog = () => {
  const { t } = useTranslation();
  const { createNewTodoFile, taskLists } = useTask();
  const { setActiveTaskListPath } = useFilter();
  const {
    listFiles,
    downloadFile,
    linkFile,
    getCloudFileRefs,
    cloudFileDialogOptions: { open, cloudStorage },
    setCloudFileDialogOptions,
  } = useCloudStorage();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CloudFile | undefined>();
  const [files, setFiles] = useState<ListCloudItemResult | undefined>();
  const [cloudFileRefs, setCloudFileRefs] = useState<CloudFileRef[]>([]);
  const createNewFile = files && files.items.length === 0;

  const handleClose = () => {
    setLoading(false);
    setSelectedFile(undefined);
    setCloudFileDialogOptions((currentValue) => ({
      ...currentValue,
      open: false,
    }));
  };

  const handleExited = () => {
    setCloudFileDialogOptions({ open: false });
    setFiles(undefined);
    setCloudFileRefs([]);
  };

  const handleSelect = async () => {
    if (!selectedFile || !open || !cloudStorage) {
      return;
    }

    setLoading(true);

    const text = await downloadFile({
      cloudFilePath: selectedFile.path,
      cloudStorage,
    });
    await createNewTodoFile(selectedFile.name, text);
    await linkFile({
      ...selectedFile,
      localFilePath: selectedFile.name,
      lastSync: new Date().toISOString(),
      cloudStorage,
    });
    setActiveTaskListPath(selectedFile.name);

    handleClose();
  };

  const handleLoadItems = useCallback(
    (path = root) => {
      if (cloudStorage) {
        listFiles({ path, cloudStorage }).then((result) => {
          if (result) {
            setFiles(result);
          }
        });
      }
    },
    [cloudStorage, listFiles]
  );

  const handleLoadMoreItems = (path = root) => {
    if (cloudStorage && files && files.hasMore && files.cursor) {
      listFiles({ path, cursor: files.cursor, cloudStorage }).then((result) => {
        if (result) {
          result.items = [...files.items, ...result.items];
          setFiles(result);
        }
      });
    }
  };

  const disableItem = (cloudFile: CloudFile) => {
    return cloudFileRefs.some((c) => c.path === cloudFile.path);
  };

  const getCloudStorage = (cloudFile: CloudFile) => {
    const ref = cloudFileRefs.find((c) => c.path === cloudFile.path);
    return ref!.cloudStorage;
  };

  useEffect(() => {
    if (open) {
      handleLoadItems(root);
      getCloudFileRefs()
        .then((refs) => refs.filter((ref) => ref.cloudStorage === cloudStorage))
        .then(setCloudFileRefs);
    }
  }, [handleLoadItems, open, getCloudFileRefs, cloudStorage]);

  return (
    <ResponsiveDialog
      maxWidth="xs"
      fullWidth
      scroll="paper"
      open={open}
      onClose={handleClose}
      TransitionProps={{
        onExited: handleExited,
      }}
    >
      <DialogTitle sx={{ px: 2 }}>
        {t(`Import from cloud storage`, {
          cloudStorage,
        })}
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {!files && (
          <Box sx={{ textAlign: "center", my: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {createNewFile && (
          <Typography sx={{ px: 2, mb: 1 }}>
            <Trans i18nKey="There are no todo.txt files" />
          </Typography>
        )}
        {createNewFile && taskLists.length > 0 && (
          <Typography variant="body2" sx={{ px: 2 }} color="text.disabled">
            <Trans i18nKey="Existing todo.txt files can be synchronized" />
          </Typography>
        )}
        {files && files.items.length > 0 && (
          <List sx={{ py: 0 }} dense>
            {files.items
              .filter((i) => i.type !== "folder")
              .map((i) => i as CloudFile)
              .map((cloudFile, idx) => (
                <ListItem
                  button
                  disabled={disableItem(cloudFile)}
                  key={idx}
                  onClick={() => setSelectedFile(cloudFile)}
                  selected={
                    selectedFile && cloudFile.path === selectedFile.path
                  }
                >
                  <Box sx={{ overflow: "hidden", flex: 1 }}>
                    <StartEllipsis sx={{ my: 0.5 }}>
                      {cloudFile.name}
                    </StartEllipsis>
                    <StartEllipsis
                      sx={{ my: 0.5 }}
                      variant="body2"
                      color="text.secondary"
                    >
                      {cloudFile.path}
                    </StartEllipsis>
                  </Box>
                  {disableItem(cloudFile) && (
                    <Box sx={{ ml: 2 }}>
                      {cloudStorageIconsDisabled[getCloudStorage(cloudFile)]}
                    </Box>
                  )}
                </ListItem>
              ))}
            {files.hasMore && (
              <ListItem button onClick={() => handleLoadMoreItems()}>
                <StartEllipsis sx={{ my: 0.5 }}>{t("Load more")}</StartEllipsis>
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("Cancel")}</Button>
        {!createNewFile && (
          <LoadingButton
            onClick={handleSelect}
            disabled={!selectedFile}
            loading={loading}
          >
            {t("Import")}
          </LoadingButton>
        )}
      </DialogActions>
    </ResponsiveDialog>
  );
};

export default CloudFileDialog;