import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { ProcessData } from "@/utils/documentProcessor";

interface FileUploadProps {
  onFileProcessed: (data: ProcessData) => void;
  isProcessing: boolean;
}

const FileUpload = ({ onFileProcessed, isProcessing }: FileUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ProcessData | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setUploadedFile(file);
    
    // Simulate file processing
    setTimeout(async () => {
      const { extractDataFromFile } = await import("@/utils/documentProcessor");
      const data = await extractDataFromFile(file);
      setExtractedData(data);
      onFileProcessed(data);
    }, 1000);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setExtractedData(null);
  };

  return (
    <Card className="glass border-glow">
      <CardHeader>
        <CardTitle className="text-lg text-foreground flex items-center">
          <Upload className="w-5 h-5 mr-2" />
          Upload do Processo
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!uploadedFile ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive 
                ? "border-primary bg-primary/10" 
                : "border-border hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground mb-2">
              Arraste e solte o arquivo do processo
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Suporta PDF, DOC, DOCX
            </p>
            
            <div className="relative">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileInput}
              />
              <Button 
                variant="outline"
                className="glass border-border hover:border-primary"
              >
                Selecionar Arquivo
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 glass rounded-lg">
              <div className="flex items-center space-x-3">
                <File className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-foreground font-medium">
                    {uploadedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {extractedData && (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={removeFile}
                  className="glass border-border hover:border-destructive"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Extracted Data Preview */}
            {extractedData && (
              <div className="p-4 glass rounded-lg space-y-2">
                <h4 className="font-semibold text-foreground mb-3">
                  📋 Dados Extraídos
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Processo:</span>
                    <p className="text-foreground font-mono">
                      {extractedData.number}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valor:</span>
                    <p className="text-foreground">{extractedData.value}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Autor:</span>
                    <p className="text-foreground">{extractedData.parties.plaintiff}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Réu:</span>
                    <p className="text-foreground">{extractedData.parties.defendant}</p>
                  </div>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 animate-spin rounded-full border-2 border-primary border-t-transparent mr-3" />
                <span className="text-foreground">Processando documento...</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;