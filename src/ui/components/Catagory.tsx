import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const Catagory = () => {


  return (
    <div className="flex flex-col gap-4 h-full justify-center items-center text-white border-r border-zinc-700/50">
      <div className="w-full flex justify-center items-center p-3">
        <Select defaultValue="1">
          <SelectTrigger className="w-full border-background/20 border-1 text-center">
            <SelectValue placeholder="Animals" />
          </SelectTrigger>
          <SelectContent className="bg-[#191818] text-gray-300">
            <SelectItem value="1">Animals</SelectItem>
            <SelectItem value="2">Buildings</SelectItem>
            <SelectItem value="3">Business</SelectItem>
            <SelectItem value="4">Drinks</SelectItem>
            <SelectItem value="5">Environment</SelectItem>
            <SelectItem value="6">Mind</SelectItem>
            <SelectItem value="7">Food</SelectItem>
            <SelectItem value="8">Graphic</SelectItem>
            <SelectItem value="9">Hobby</SelectItem>
            <SelectItem value="10">Industry</SelectItem>
            <SelectItem value="11">Landscape</SelectItem>
            <SelectItem value="12">Lifestyle</SelectItem>
            <SelectItem value="13">People</SelectItem>
            <SelectItem value="14">Plant</SelectItem>
            <SelectItem value="15">Culture</SelectItem>
            <SelectItem value="16">Science</SelectItem>
            <SelectItem value="17">Social</SelectItem>
            <SelectItem value="18">Sport</SelectItem>
            <SelectItem value="19">Technology</SelectItem>
            <SelectItem value="20">Transport</SelectItem>
            <SelectItem value="21">Travel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-4 w-full px-3">
        <div className="w-full flex justify-center items-center">
          <Select defaultValue="Abstract">
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue placeholder="Abstract" />
            </SelectTrigger>
            <SelectContent className="bg-[#191818] text-gray-300">
              <SelectItem value="Abstract">Abstract</SelectItem>
              <SelectItem value="Animals/Wildlife">Animals/Wildlife</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Backgrounds/Textures">
                Backgrounds/Textures
              </SelectItem>
              <SelectItem value="Beauty/Fashion">Beauty/Fashion</SelectItem>
              <SelectItem value="Buildings/Landmarks">
                Buildings/Landmarks
              </SelectItem>
              <SelectItem value="Business/Finance">Business/Finance</SelectItem>
              <SelectItem value="Celebrities">Celebrities</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Food and drink">Food and drink</SelectItem>
              <SelectItem value="Healthcare/Medical">
                Healthcare/Medical
              </SelectItem>
              <SelectItem value="Holidays">Holidays</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Interiors">Interiors</SelectItem>
              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              <SelectItem value="Nature">Nature</SelectItem>
              <SelectItem value="Objects">Objects</SelectItem>
              <SelectItem value="Parks/Outdoor">Parks/Outdoor</SelectItem>
              <SelectItem value="People">People</SelectItem>
              <SelectItem value="Religion">Religion</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Signs/Symbols">Signs/Symbols</SelectItem>
              <SelectItem value="Sports/Recreation">
                Sports/Recreation
              </SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full flex justify-center items-center">
          <Select defaultValue="Abstract">
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue placeholder="Abstract" />
            </SelectTrigger>
            <SelectContent className="bg-[#191818] text-gray-300">
              <SelectItem value="Abstract">Abstract</SelectItem>
              <SelectItem value="Animals/Wildlife">Animals/Wildlife</SelectItem>
              <SelectItem value="Arts">Arts</SelectItem>
              <SelectItem value="Backgrounds/Textures">
                Backgrounds/Textures
              </SelectItem>
              <SelectItem value="Beauty/Fashion">Beauty/Fashion</SelectItem>
              <SelectItem value="Buildings/Landmarks">
                Buildings/Landmarks
              </SelectItem>
              <SelectItem value="Business/Finance">Business/Finance</SelectItem>
              <SelectItem value="Celebrities">Celebrities</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Food and drink">Food and drink</SelectItem>
              <SelectItem value="Healthcare/Medical">
                Healthcare/Medical
              </SelectItem>
              <SelectItem value="Holidays">Holidays</SelectItem>
              <SelectItem value="Industrial">Industrial</SelectItem>
              <SelectItem value="Interiors">Interiors</SelectItem>
              <SelectItem value="Miscellaneous">Miscellaneous</SelectItem>
              <SelectItem value="Nature">Nature</SelectItem>
              <SelectItem value="Objects">Objects</SelectItem>
              <SelectItem value="Parks/Outdoor">Parks/Outdoor</SelectItem>
              <SelectItem value="People">People</SelectItem>
              <SelectItem value="Religion">Religion</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="Signs/Symbols">Signs/Symbols</SelectItem>
              <SelectItem value="Sports/Recreation">
                Sports/Recreation
              </SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Vintage">Vintage</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default Catagory;
