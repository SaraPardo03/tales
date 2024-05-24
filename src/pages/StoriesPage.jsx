import { ref, set, onValue, push, serverTimestamp} from "firebase/database";
import { db } from '../configs/firebaseConfig';
import {useEffect, useState, useContext} from "react";
import { Context as AuthContext } from '../Context/AuthContext';
import Story from '../models/Story';
import Stories from "../components/stories/Stories.jsx";
import Page from '../models/Page';
import StoriesMainNav from "../components/stories/StoriesMainNav.jsx";
import StoriesFooterMainNav from "../components/stories/StoriesFooterMainNav.jsx";

export function StoriesPage() {
  const {user} = useContext(AuthContext);
  const [stories, setStories] = useState([]);
  const storiesRef = ref(db, `stories/${user.id}`);

  //Get all the stories
  useEffect(() => {
    const getStoriesByUserId= async () => {
      try {
        const storiesData = await Story.getStoriesByUserId(user.id);
        setStories(storiesData);
      } catch (error) {
        console.error('Error geting stories data:', error);
      }
    };

    getStoriesByUserId();
  }, []);

  const addNewStoryToBDD = async (story) => {
    const newStory = new Story(story);
    newStory.createdAt = new Date();
    newStory.updatedAt = new Date();
    
   // Save the new story to the database
   try{
    const savedStory = await newStory.save(user.id);
    setStories((prevStories) => [...prevStories, savedStory]);
    //setStories[arrayStories];
    /*
    // Add the first page to the story
    const firstPage = new Page({
      end: false,
      first: true,
      title: "Titre",
      text: "Que l'aventure commence!"
    });

    await firstPage.save(storyId);*/

     // Save the first page with the story ID*/
    return savedStory;
   }
   catch(error){
    console.error('Error saving story up:', error);
   }
    
  };
  const updateStoryToBDD = async (story) => {
    const updatedStory = new Story(story);
    updatedStory.updatedAt = new Date();
    try {
      await updatedStory.update();
      setStories((prevStories) =>
        prevStories.map((s) => (s.id === story.id ? updatedStory : s))
      );
    } catch (error) {
      console.error('Error updating story:', error);
    }
  };
  
  const deleteStoryToBDD = async (story) => {
    const storyToDelete = new Story(story);
    try {
      await storyToDelete.delete();
      setStories((prevStories) => prevStories.filter((s) => s.id !== story.id));
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };
  
  return<div className="bg-primary">
    <StoriesMainNav stories={stories} addNewStoryToBDD={addNewStoryToBDD}/>
    <div className="container-fluid bg-container stories-container">
        <Stories stories={stories} updateStoryToBDD={updateStoryToBDD} addNewStoryToBDD={addNewStoryToBDD} deleteStoryToBDD={deleteStoryToBDD} />
    </div>
    <StoriesFooterMainNav stories={stories} addNewStoryToBDD={addNewStoryToBDD}/>
  </div>;
}