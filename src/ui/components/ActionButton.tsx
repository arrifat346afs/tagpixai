
import Export from "./expoert/Export"
import FileSelector from "./fileuplode/FileSeccletor"
import GenerateButton from "./generate-button/GenerateButton"

const ActionButton = () => {
  return (
    <div className=" col-span-3 h-full border-b border-t border-zinc-700/50">
      <div className="flex gap-4 justify-center items-center h-full my-2">
        <FileSelector/>
        <GenerateButton/>
        <Export/>
      </div>
    </div>
  )
}

export default ActionButton
