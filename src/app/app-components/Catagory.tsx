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
  const [adobeStock, setAdobeStock] = useState("1");
  const [shutterStock1, setShutterStock1] = useState("Abstract");
  const [shutterStock2, setShutterStock2] = useState("Abstract");

  // Helper function to find the best Adobe Stock category based on keywords
  const findBestAdobeCategory = (text: string) => {
    let bestMatch = "1"; // Default to Animals
    let maxMatches = 0;

    Object.entries(KEYWORD_TO_CATEGORY_MAP).forEach(([categoryId, keywords]) => {
      const matches = keywords.filter(keyword => text.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = categoryId;
      }
    });

    setAdobeStock(bestMatch);
  };

  // Load saved categories when component mounts or file changes
  useEffect(() => {
    const loadTempCategories = async () => {
      if (selectedFileMetadata?.filePath) {
        const savedCategories = await window.electron.getTempCategories(selectedFileMetadata.filePath) as {
          adobe?: string;
          shutter1?: string;
          shutter2?: string;
        } | null;

        if (savedCategories) {
          // Check if properties exist before setting them
          if (savedCategories.adobe) {
            setAdobeStock(savedCategories.adobe);
          }
          if (savedCategories.shutter1) {
            setShutterStock1(savedCategories.shutter1);
          }
          if (savedCategories.shutter2) {
            setShutterStock2(savedCategories.shutter2);
          }
          console.log('Loaded temp categories:', savedCategories);
        }
      }
    };
    loadTempCategories();
  }, [selectedFileMetadata]);

  // Save categories whenever they change
  useEffect(() => {
    const saveTempCategories = async () => {
      if (selectedFileMetadata?.filePath) {
        const categories = {
          adobe: adobeStock,
          shutter1: shutterStock1,
          shutter2: shutterStock2
        };

        try {
          await window.electron.saveTempCategories(selectedFileMetadata.filePath, categories);
          console.log('Saved temp categories for file:', selectedFileMetadata.filePath);
          console.log('Categories saved:', categories);

          // Verify the save by immediately reading back
          const savedCategories = await window.electron.getTempCategories(selectedFileMetadata.filePath);
          console.log('Verified saved categories:', savedCategories);
        } catch (error) {
          console.error('Failed to save categories:', error);
        }
      } else {
        console.warn('Cannot save categories: No file path in selectedFileMetadata');
      }
    };

    saveTempCategories();
  }, [adobeStock, shutterStock1, shutterStock2, selectedFileMetadata]);

  useEffect(() => {
    if (selectedFileMetadata) {
      const { keywords, title, description } = selectedFileMetadata;

      // Combine all text for analysis
      const allText = [
        ...(keywords || []),
        title || "",
        description || ""
      ].join(" ").toLowerCase();

      // Find matching main category for Adobe Stock
      // Check if there's a keyword that starts with 'adobe_category:'
      const adobeCategoryKeyword = keywords?.find(keyword =>
        keyword.toLowerCase().startsWith('adobe_category:'));

      if (adobeCategoryKeyword) {
        // Extract the category ID from the keyword
        const categoryId = adobeCategoryKeyword.split(':')[1]?.trim();
        if (categoryId && Object.keys(KEYWORD_TO_CATEGORY_MAP).includes(categoryId)) {
          setAdobeStock(categoryId);
        } else {
          // Fallback to keyword matching
          findBestAdobeCategory(allText);
        }
      } else {
        // No explicit category found, use keyword matching
        findBestAdobeCategory(allText);
      }

      // Set subcategories based on similar logic
      // You can implement more sophisticated matching for subcategories
      // This is a simplified example
      // Shutterstock category mapping (exact option text)
      const shutterstockCategories = {
        'Abstract': ['abstract', 'pattern', 'design'],
        'Animals/Wildlife': ['animal', 'wildlife', 'pet', 'zoo', 'fauna'],
        'Arts': ['art', 'painting', 'illustration', 'drawing'],
        'Backgrounds/Textures': ['background', 'texture', 'wallpaper', 'grunge'],
        'Beauty/Fashion': ['beauty', 'fashion', 'makeup', 'style'],
        'Buildings/Landmarks': ['building', 'architecture', 'landmark', 'cityscape'],
        'Business/Finance': ['business', 'finance', 'money', 'corporate'],
        'Celebrities': ['celebrity', 'famous', 'star', 'entertainment'],
        'Education': ['education', 'school', 'learning', 'books'],
        'Food and drink': ['food', 'drink', 'cuisine', 'meal'],
        'Healthcare/Medical': ['healthcare', 'medical', 'hospital', 'doctor'],
        'Holidays': ['holiday', 'celebration', 'festive', 'Christmas'],
        'Industrial': ['industrial', 'factory', 'manufacturing', 'engineering'],
        'Interiors': ['interior', 'design', 'home', 'furniture'],
        'Miscellaneous': ['miscellaneous', 'various', 'random'],
        'Nature': ['nature', 'tree', 'forest', 'mountain', 'landscape'],
        'Objects': ['object', 'item', 'thing', 'accessory'],
        'Parks/Outdoor': ['park', 'outdoor', 'recreation', 'nature'],
        'People': ['people', 'person', 'crowd', 'portrait'],
        'Religion': ['religion', 'faith', 'worship', 'spiritual'],
        'Science': ['science', 'experiment', 'laboratory', 'research'],
        'Signs/Symbols': ['sign', 'symbol', 'icon', 'signal'],
        'Sports/Recreation': ['sports', 'recreation', 'fitness', 'exercise'],
        'Technology': ['tech', 'computer', 'software', 'hardware', 'digital'],
        'Transportation': ['transport', 'vehicle', 'car', 'travel'],
        'Vintage': ['vintage', 'retro', 'old', 'classic']
      };

      // Find best matching categories for Shutterstock
      let bestMatch1 = "Abstract";
      let bestMatch2 = "Abstract";
      let maxMatches1 = 0;
      let maxMatches2 = 0;

      Object.entries(shutterstockCategories).forEach(([category, keywords]) => {
        const matches = keywords.filter(keyword => allText.includes(keyword)).length;
        if (matches > maxMatches1) {
          // Move current best match to second place
          maxMatches2 = maxMatches1;
          bestMatch2 = bestMatch1;
          // Set new best match
          maxMatches1 = matches;
          bestMatch1 = category;
        } else if (matches > maxMatches2 && category !== bestMatch1) {
          maxMatches2 = matches;
          bestMatch2 = category;
        }
      });

      setShutterStock1(bestMatch1);
      setShutterStock2(bestMatch2);
    }
  }, [selectedFileMetadata]);

  // Debug function to check current categories


  return (
    <div className="flex flex-col gap-4 h-full justify-center items-center border-r border-zinc-700/50">
      <div className="w-full flex flex-col gap-2 items-center p-3">

        <Select  value={adobeStock} onValueChange={setAdobeStock} >
          <SelectTrigger className="w-full border-background/20 border-1 text-center bg-transparent">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
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
          <Select value={shutterStock1} onValueChange={setShutterStock1}>
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent >
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
          <Select value={shutterStock2} onValueChange={setShutterStock2}>
            <SelectTrigger className="w-full border-background/20 border-1 text-center">
              <SelectValue />
            </SelectTrigger>
            <SelectContent >
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
