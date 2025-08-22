import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Eye } from "lucide-react";
import { ProcessData, generateDocument } from "@/utils/documentProcessor";

interface DocumentTemplatesProps {
  processData: ProcessData | null;
  assistantType: string;
  onDocumentGenerated: (document: string) => void;
}

const DocumentTemplates = ({ processData, assistantType, onDocumentGenerated }: DocumentTemplatesProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [additionalData, setAdditionalData] = useState<any>({});
  const [generatedDoc, setGeneratedDoc] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Templates específicos para Assistente Processual
  const processualTemplates = [
    {
      id: "manifestacao-endereco",
      name: "Manifestação de Novo Endereço",
      description: "Comunicar mudança de endereço nos autos",
      fields: [
        { key: "newAddress", label: "Novo Endereço", type: "text", required: true },
        { key: "observations", label: "Observações", type: "textarea" }
      ]
    },
    {
      id: "dilacao-prazo", 
      name: "Dilação de Prazo",
      description: "Solicitar prorrogação de prazo processual",
      fields: [
        { key: "days", label: "Dias solicitados", type: "number", required: true },
        { key: "reason", label: "Motivo", type: "textarea", required: true },
        { key: "observations", label: "Observações", type: "textarea" }
      ]
    },
    {
      id: "pesquisa-endereco",
      name: "Pesquisa de Endereço", 
      description: "Solicitar pesquisa de endereço de parte",
      fields: [
        { key: "targetParty", label: "Parte a ser pesquisada", type: "text", required: true },
        { key: "searchOrgans", label: "Órgãos de pesquisa", type: "text", required: true },
        { key: "justification", label: "Justificativa", type: "textarea", required: true }
      ]
    }
  ];

  const handleFieldChange = (key: string, value: string) => {
    setAdditionalData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerateDocument = () => {
    if (!processData || !selectedTemplate) return;

    const document = generateDocument(selectedTemplate, processData, additionalData);
    setGeneratedDoc(document);
    onDocumentGenerated(document);
  };

  const handleDownload = () => {
    if (!generatedDoc) return;

    const blob = new Blob([generatedDoc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-${processData?.number || 'documento'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedTemplateData = processualTemplates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Template Selection */}
      <Card className="glass border-glow">
        <CardHeader>
          <CardTitle className="text-lg text-foreground flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Modelos de Documentos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Selecione o tipo de peça:</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger className="glass border-border">
                <SelectValue placeholder="Escolha um modelo..." />
              </SelectTrigger>
              <SelectContent className="glass border-border">
                {processualTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {template.description}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Fields */}
          {selectedTemplateData && (
            <div className="space-y-4 p-4 glass rounded-lg">
              <h4 className="font-semibold text-foreground">
                Dados específicos para: {selectedTemplateData.name}
              </h4>
              
              {selectedTemplateData.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-foreground">
                    {field.label} {field.required && <span className="text-destructive">*</span>}
                  </Label>
                  
                  {field.type === "textarea" ? (
                    <Textarea
                      placeholder={`Digite ${field.label.toLowerCase()}...`}
                      value={additionalData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="glass border-border focus:border-primary"
                    />
                  ) : field.type === "number" ? (
                    <Input
                      type="number"
                      placeholder={`Digite ${field.label.toLowerCase()}...`}
                      value={additionalData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="glass border-border focus:border-primary"
                    />
                  ) : (
                    <Input
                      type="text"
                      placeholder={`Digite ${field.label.toLowerCase()}...`}
                      value={additionalData[field.key] || ""}
                      onChange={(e) => handleFieldChange(field.key, e.target.value)}
                      className="glass border-border focus:border-primary"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleGenerateDocument}
              disabled={!processData || !selectedTemplate}
              className="flex-1 bg-gradient-brand hover:scale-105 transition-all duration-300"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Documento
            </Button>
            
            {generatedDoc && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="glass border-border hover:border-primary"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="glass border-border hover:border-primary"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Document Preview */}
      {showPreview && generatedDoc && (
        <Card className="glass border-glow">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">
              📄 Preview do Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 glass rounded-lg">
              <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                {generatedDoc}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentTemplates;