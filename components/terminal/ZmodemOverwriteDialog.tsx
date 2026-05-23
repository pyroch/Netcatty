import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";

interface Props {
  filename: string;
  onRespond: (action: "overwrite" | "skip" | "cancel", applyToRest: boolean) => void;
}

export const ZmodemOverwriteDialog: React.FC<Props> = ({ filename, onRespond }) => {
  const [applyToRest, setApplyToRest] = useState(false);
  return (
    <Dialog open onOpenChange={(o) => { if (!o) onRespond("cancel", false); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>远端已存在同名文件</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground break-all">{filename}</p>
        <label className="flex items-center gap-2 text-sm mt-2">
          <input type="checkbox" checked={applyToRest} onChange={(e) => setApplyToRest(e.target.checked)} />
          应用到其余冲突文件
        </label>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onRespond("cancel", applyToRest)}>取消</Button>
          <Button variant="outline" onClick={() => onRespond("skip", applyToRest)}>跳过</Button>
          <Button onClick={() => onRespond("overwrite", applyToRest)}>覆盖</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
