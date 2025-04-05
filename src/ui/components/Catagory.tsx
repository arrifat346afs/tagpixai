import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContext } from "react";
import { FileContext } from "./FileContext";

// Category mapping object
const KEYWORD_TO_CATEGORY_MAP: Record<string, string[]> = {
  "1": ["animal", "wildlife", "pet", "zoo", "creature", "beast", "fauna"],
  "2": ["building", "architecture", "house", "structure", "construction"],
  "3": ["business", "corporate", "office", "professional", "commerce"],
  "4": ["drink", "beverage", "cocktail", "wine", "coffee"],
  "5": ["environment", "nature", "eco", "climate", "sustainable"],
  "6": ["mind", "mental", "psychology", "brain", "thinking"],
  "7": ["food", "cuisine", "meal", "dish", "cooking"],
  "8": ["graphic", "design", "art", "digital", "illustration"],
  "9": ["hobby", "leisure", "craft", "pastime", "collection"],
  "10": ["industry", "factory", "manufacturing", "industrial", "production"],
  "11": ["landscape", "scenery", "vista", "panorama", "outdoor"],
  "12": ["lifestyle", "living", "daily", "routine", "life"],
  "13": ["people", "person", "human", "portrait", "face"],
  "14": ["plant", "flower", "tree", "botanical", "flora"],
  "15": ["culture", "tradition", "heritage", "customs", "ritual"],
  "16": ["science", "research", "laboratory", "experiment", "scientific"],
  "17": ["social", "community", "gathering", "society", "group"],
  "18": ["sport", "athletic", "game", "exercise", "fitness"],
  "19": ["technology", "tech", "digital", "electronic", "device"],
  "20": ["transport", "vehicle", "car", "transportation", "travel"],
  "21": ["travel", "tourism", "vacation", "journey", "trip"]
};

const Category = () => {
  const { selectedFileMetadata } = useContext(FileContext);
  const [mainCategory, setMainCategory] = useState("1");
  const [subCategory1, setSubCategory1] = useState("Abstract");
  const [subCategory2, setSubCategory2] = useState("Abstract");

  useEffect(() => {
    if (selectedFileMetadata) {
      const { keywords, title, description } = selectedFileMetadata;
      
      // Combine all text for analysis
      const allText = [
        ...(keywords || []),
        title || "",
        description || ""
      ].join(" ").toLowerCase();

      // Find matching main category
      let bestMatch = "1"; // Default to Animals
      let maxMatches = 0;

      Object.entries(KEYWORD_TO_CATEGORY_MAP).forEach(([categoryId, keywords]) => {
        const matches = keywords.filter(keyword => allText.includes(keyword)).length;
        if (matches > maxMatches) {
          maxMatches = matches;
          bestMatch = categoryId;
        }
      });

      setMainCategory(bestMatch);

      // Set subcategories based on similar logic
      // You can implement more sophisticated matching for subcategories
      // This is a simplified example
      if (allText.includes("nature")) {
        setSubCategory1("Nature");
        setSubCategory2("Parks/Outdoor");
      } else if (allText.includes("business")) {
        setSubCategory1("Business/Finance");
        setSubCategory2("Technology");
      }
      // Add more subcategory matching logic as needed
    }
  }, [selectedFileMetadata]);

  return (
    <div className="flex flex-col gap-4 h-full justify-center items-center text-white border-r border-zinc-700/50">
      <div className="w-full flex justify-center items-center p-3">
        <Select value={mainCategory} onValueChange={setMainCategory}>
          <SelectTrigger className="w-full border-background/20 border-1 text-center">
            <SelectValue />
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
          <Select value={subCategory1} onValueChange={setSubCategory1}>
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue />
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
          <Select value={subCategory2} onValueChange={setSubCategory2}>
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue />
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

export default Category;
