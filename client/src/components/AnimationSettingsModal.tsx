import { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAnimation } from "@/contexts/AnimationContext";
import { Settings } from "lucide-react";

interface AnimationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnimationSettingsModal({ 
  isOpen, 
  onClose 
}: AnimationSettingsModalProps) {
  const { 
    pageTransitions, 
    cardAnimations, 
    chartAnimations, 
    togglePageTransitions, 
    toggleCardAnimations, 
    toggleChartAnimations 
  } = useAnimation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <span>Animation Settings</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="page-transitions">Page Transitions</Label>
              <p className="text-sm text-gray-500">
                Animate when changing between pages
              </p>
            </div>
            <Switch 
              id="page-transitions" 
              checked={pageTransitions}
              onCheckedChange={togglePageTransitions}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="card-animations">Card Animations</Label>
              <p className="text-sm text-gray-500">
                Enable animations on cards and UI elements
              </p>
            </div>
            <Switch 
              id="card-animations" 
              checked={cardAnimations}
              onCheckedChange={toggleCardAnimations}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chart-animations">Chart Animations</Label>
              <p className="text-sm text-gray-500">
                Enable animations on graphs and charts
              </p>
            </div>
            <Switch 
              id="chart-animations" 
              checked={chartAnimations}
              onCheckedChange={toggleChartAnimations}
            />
          </div>
          
          <div className="rounded-md bg-muted p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity,
                    repeatType: "loop"
                  }}
                >
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </motion.div>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-muted-foreground">
                  Disabling animations can improve performance on older devices.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}