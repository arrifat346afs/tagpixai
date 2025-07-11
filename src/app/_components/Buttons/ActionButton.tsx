
import { Separator } from "@/components/ui/separator"
import FileSelector from "../fileupload/FileSeccletor"
import GenerateButton from "../generate-button/GenerateButton"
import Export from "../expoert/Export"


const ActionButton = () => {
  return (
    <div className=" col-span-3 h-full border-b border-t select-none">
      <div className="flex gap-4 justify-center items-center h-full my-2">
        <FileSelector/>
        <Separator orientation="vertical" />
        <GenerateButton/>
        <Separator orientation="vertical" />
        <Export/>
      </div>
    </div>
  )
}

export default ActionButton
