import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useState } from "react";
import { PanelRight } from "lucide-react";

const ResizeHandle = () => {
  return (
    <PanelResizeHandle className="w-2 hover:w-3 transition-all duration-150 bg-gray-700 hover:bg-teal-600 cursor-col-resize" />
  );
};

interface ResizableLayoutProps {
  leftPanel: React.ReactNode;
  chatPanel: React.ReactNode;
  calendarPanel: React.ReactNode;
}

export default function ResizableLayout({
  leftPanel,
  chatPanel,
  calendarPanel,
}: ResizableLayoutProps) {
  const [leftSize, setLeftSize] = useState(20); // 20% of total width
  const [chatSize, setChatSize] = useState(50); // 50% of total width
  const [rightSize, setRightSize] = useState(30); // 30% of total width

  return (
    <div className="h-screen bg-gray-900">
      <PanelGroup direction="horizontal" className="h-full">
        {/* Left Panel */}
        <PanelRight
          className="absolute top-4 left-4 z-10 text-white cursor-pointer"
          onClick={() => setLeftSize(leftSize === 0 ? 20 : 0)}
        />
        <Panel
          defaultSize={leftSize}
          minSize={15}
          maxSize={30}
          className="bg-gray-900 p-4"
        >
          {leftPanel}
        </Panel>

        <ResizeHandle />

        {/* Chat Panel */}
        <Panel
          defaultSize={chatSize}
          minSize={40}
          maxSize={60}
          className="bg-gray-800"
        >
          {chatPanel}
        </Panel>

        <ResizeHandle />

        {/* Calendar Panel */}
        <Panel
          defaultSize={rightSize}
          minSize={20}
          maxSize={40}
          className="bg-teal-900/30"
        >
          {calendarPanel}
        </Panel>
      </PanelGroup>
    </div>
  );
}
