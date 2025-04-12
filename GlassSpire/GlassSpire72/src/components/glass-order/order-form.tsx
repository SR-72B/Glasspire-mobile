import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const glassThicknessOptions = [
  { value: "1/8", label: "⅛ inch" },
  { value: "1/4", label: "¼ inch" },
  { value: "3/8", label: "⅜ inch" },
  { value: "1/2", label: "½ inch" },
  { value: "3/4", label: "¾ inch" },
  { value: "9/16 Laminated", label: "9/16 Laminated" },
];

const glassFinishOptions = [
  { value: "clear", label: "Clear" },
  { value: "acid_edge", label: "Acid Edge" },
  { value: "grey", label: "Grey" },
  { value: "bronze", label: "Bronze" },
  { value: "mirror", label: "Mirror" },
  { value: "low_iron", label: "Low Iron" },
  { value: "white_painted", label: "White Painted Glass" },
  { value: "rain_glass", label: "Rain Glass" },
  { value: "acid_edge_low_iron", label: "Acid Edge Low Iron" },
];

export function OrderForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: session } = fine.auth.useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [measurementUnit, setMeasurementUnit] = useState<"inches" | "feet">("inches");
  
  const [formData, setFormData] = useState({
    glassThickness: "1/4",
    glassFinish: "clear",
    tempering: false,
    dfiCoating: false,
    width: "",
    height: "",
    widthFeet: "",
    widthInches: "",
    heightFeet: "",
    heightInches: "",
    quantity: "1",
    notes: "",
    imageUrl: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a storage service
      // For now, we'll just create a local URL
      const imageUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, imageUrl }));
    }
  };

  const calculateDimensions = () => {
    if (measurementUnit === "inches") {
      return {
        width: parseFloat(formData.width),
        height: parseFloat(formData.height),
      };
    } else {
      const widthFeet = parseFloat(formData.widthFeet) || 0;
      const widthInches = parseFloat(formData.widthInches) || 0;
      const heightFeet = parseFloat(formData.heightFeet) || 0;
      const heightInches = parseFloat(formData.heightInches) || 0;
      
      return {
        width: widthFeet * 12 + widthInches,
        height: heightFeet * 12 + heightInches,
      };
    }
  };

  const validateForm = () => {
    const { width, height } = calculateDimensions();
    
    if (!width || width <= 0) {
      toast({
        title: "Invalid width",
        description: "Please enter a valid width",
        variant: "destructive",
      });
      return false;
    }
    
    if (!height || height <= 0) {
      toast({
        title: "Invalid height",
        description: "Please enter a valid height",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.glassThickness) {
      toast({
        title: "Missing glass thickness",
        description: "Please select a glass thickness",
        variant: "destructive",
      });
      return false;
    }
    
    if (!formData.glassFinish) {
      toast({
        title: "Missing glass finish",
        description: "Please select a glass finish",
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    if (!session?.user?.id) {
      toast({
        title: "Not logged in",
        description: "Please log in to submit an order",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { width, height } = calculateDimensions();
      
      // Create order
      const orderData = {
        customerId: parseInt(session.user.id),
        status: "received" as "received" | "cut" | "tempered" | "ready",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const newOrder = await fine.table("orders").insert(orderData).select();
      
      if (newOrder && newOrder.length > 0) {
        // Create order details
        const orderDetailsData = {
          orderId: newOrder[0].id,
          glassThickness: formData.glassThickness,
          glassFinish: formData.glassFinish,
          tempering: formData.tempering,
          dfiCoating: formData.dfiCoating,
          width,
          height,
          quantity: parseInt(formData.quantity),
          notes: formData.notes,
          imageUrl: formData.imageUrl,
        };
        
        await fine.table("orderDetails").insert(orderDetailsData);
        
        toast({
          title: "Order submitted",
          description: "Your glass order has been submitted successfully",
        });
        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      toast({
        title: "Error",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePreview = () => {
    if (!previewMode && !validateForm()) return;
    setPreviewMode(!previewMode);
  };

  const renderPreview = () => {
    const { width, height } = calculateDimensions();
    const selectedThickness = glassThicknessOptions.find(opt => opt.value === formData.glassThickness);
    const selectedFinish = glassFinishOptions.find(opt => opt.value === formData.glassFinish);
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Order Preview</h2>
        
        <div className="rounded-lg border p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium">Glass Specifications</h3>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Thickness:</div>
                  <div>{selectedThickness?.label}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Finish:</div>
                  <div>{selectedFinish?.label}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Tempering:</div>
                  <div>{formData.tempering ? "Yes" : "No"}</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">DFI Coating:</div>
                  <div>{formData.dfiCoating ? "Yes" : "No"}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Dimensions</h3>
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Width:</div>
                  <div>{width} inches</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Height:</div>
                  <div>{height} inches</div>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <div className="text-sm font-medium text-muted-foreground">Quantity:</div>
                  <div>{formData.quantity}</div>
                </div>
              </div>
            </div>
          </div>
          
          {formData.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Additional Notes</h3>
              <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{formData.notes}</p>
            </div>
          )}
          
          {formData.imageUrl && (
            <div className="mt-6">
              <h3 className="text-lg font-medium">Uploaded Image</h3>
              <div className="mt-2 overflow-hidden rounded-md border">
                <img src={formData.imageUrl} alt="Order reference" className="h-auto max-h-64 w-full object-contain" />
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-between">
          <Button variant="outline" onClick={togglePreview}>
            Edit Order
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Order"
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderForm = () => (
    <form onSubmit={(e) => { e.preventDefault(); togglePreview(); }} className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">Glass Specifications</h2>
        <div className="mt-4 grid gap-6">
          <div className="space-y-2">
            <Label htmlFor="glassThickness">Glass Thickness</Label>
            <Select
              value={formData.glassThickness}
              onValueChange={(value) => handleSelectChange("glassThickness", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select thickness" />
              </SelectTrigger>
              <SelectContent>
                {glassThicknessOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="glassFinish">Glass Finish</Label>
            <Select
              value={formData.glassFinish}
              onValueChange={(value) => handleSelectChange("glassFinish", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select finish" />
              </SelectTrigger>
              <SelectContent>
                {glassFinishOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="tempering" className="flex-1">
              Tempering
            </Label>
            <Switch
              id="tempering"
              checked={formData.tempering}
              onCheckedChange={(checked) => handleSwitchChange("tempering", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="dfiCoating" className="flex-1">
              DFI Coating
            </Label>
            <Switch
              id="dfiCoating"
              checked={formData.dfiCoating}
              onCheckedChange={(checked) => handleSwitchChange("dfiCoating", checked)}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold">Dimensions</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Measurement Unit</Label>
            <RadioGroup
              value={measurementUnit}
              onValueChange={(value) => setMeasurementUnit(value as "inches" | "feet")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inches" id="inches" />
                <Label htmlFor="inches">Inches</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="feet" id="feet" />
                <Label htmlFor="feet">Feet & Inches</Label>
              </div>
            </RadioGroup>
          </div>
          
          {measurementUnit === "inches" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="width">Width (inches)</Label>
                <Input
                  id="width"
                  name="width"
                  type="number"
                  step="0.125"
                  placeholder="Enter width in inches"
                  value={formData.width}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  step="0.125"
                  placeholder="Enter height in inches"
                  value={formData.height}
                  onChange={handleInputChange}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Width</Label>
                <div className="flex space-x-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="widthFeet" className="text-xs">
                      Feet
                    </Label>
                    <Input
                      id="widthFeet"
                      name="widthFeet"
                      type="number"
                      placeholder="Feet"
                      value={formData.widthFeet}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="widthInches" className="text-xs">
                      Inches
                    </Label>
                    <Input
                      id="widthInches"
                      name="widthInches"
                      type="number"
                      step="0.125"
                      placeholder="Inches"
                      value={formData.widthInches}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Height</Label>
                <div className="flex space-x-2">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="heightFeet" className="text-xs">
                      Feet
                    </Label>
                    <Input
                      id="heightFeet"
                      name="heightFeet"
                      type="number"
                      placeholder="Feet"
                      value={formData.heightFeet}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="heightInches" className="text-xs">
                      Inches
                    </Label>
                    <Input
                      id="heightInches"
                      name="heightInches"
                      type="number"
                      step="0.125"
                      placeholder="Inches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              placeholder="Enter quantity"
              value={formData.quantity}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold">Additional Information</h2>
        <div className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any special instructions or requirements"
              value={formData.notes}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="image">Upload Reference Image (Optional)</Label>
            <div className="mt-1 flex items-center">
              <label
                htmlFor="image-upload"
                className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-input bg-background hover:bg-accent/50"
              >
                {formData.imageUrl ? (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 py-4">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <div className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </div>
                  </div>
                )}
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit">Preview Order</Button>
      </div>
    </form>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        {previewMode ? renderPreview() : renderForm()}
      </CardContent>
    </Card>
  );
}