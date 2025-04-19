const ExportSettingsDialog = ({ 
    open, 
    onOpenChange, 
    onExport, 
    defaultRepeatCount = 0,
    labelType,
    isLoading 
  }) => {
    const [repeatCount, setRepeatCount] = useState(defaultRepeatCount);
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Çıktı Ayarları</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="repeatCount" className="text-right">
                Tekrar Sayısı
              </Label>
              <Input
                id="repeatCount"
                type="number"
                min="0"
                value={repeatCount}
                onChange={(e) => setRepeatCount(Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            
            {/* İleride başka ayarlar eklemek için alan */}
            {labelType === "AderBMK" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="exportType" className="text-right">
                  Export Tipi
                </Label>
                <Select defaultValue="HeadEnd">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Export tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HeadEnd">HeadEnd</SelectItem>
                    <SelectItem value="Full">Full</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <LoadingButton
              isLoading={isLoading}
              onClick={() => onExport(repeatCount)}
            >
              Çıktı Al
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };