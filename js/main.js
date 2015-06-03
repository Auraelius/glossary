// Glossary example with both local and remote storage
// Copyright 2015 Alan Zimmerman
// Used by permision by Portland Code School

// For earlier versions (with local storage) use git tags to
// check out the appropriate commit

/* 
  in the following code, we keep the remote storage up to date after 
  we update the local copy of the dictionary

  When we add a word, we immediately display the updated local dictionary

  Then we start working with the remote server.

  Because the remote storage is soo slow (hundreds of milliseconds)
  we have to use callback functions that run when the server 
  requests complete.

  Once we are up and running and we know the local and the remote
  copies of the dictionary are in sync, we can update the word list
  from the local copy (but there's a bug lurking in this scheme...
  read the code to find it...)

  But when we are setting up the app, we have to actually know
  what's on the server before proceeding. So, we perform further 
  requests to the remote server inside the callbacks
  to make sure that the data is up to date before proceeding. For
  example, we can't do the initial display of the dictionary until 
  we get it and we can't get the dictionary until we know it exists 

  This all takes time. When we hear back from the server, we update the 
  word list. There is a visible delay from the time we load the page
  to the time the word list refreshes.
*/

/*
  These global variables save the application state.
  We could and probably should pass the application state
  among the various functions as an object but this is 
  clearer for beginners despite it being less idiomatic JavaScript
*/
var localDictionary = []; // local dictionary
var dictionaryUUID = 0; // remote dictionary UUID - will be set via call to apigee
var collectionType = "dict02";

// Set up the dictionary and event handlers
$(document).ready( function(){
  initDictionary(); 
  $("#addButton").click(addWord); 
  $("#clearButton").click(clearDictionary);
});

// set up apigiee connection with our credentials
function getApigeeClient(){
  return new Usergrid.Client({
   orgName:"azimmerman",
   appName:"sandbox"
   // logging: true,
   // buildCurl: true
  });
}

// read form, update local dictionary and save it to remote
function addWord (e){
  console.log("Running addWord");
  // get form contents, add it to the dictionary, save dictionary, display dictionary
  var entry={};
  entry.word = $("#word").val();      // get values from form
  entry.def = $("#definition").val();
  localDictionary.push(entry);        // update local dictionary
  displayLocalDictionary();                // display it
  saveDictionary();                   // store it
  e.preventDefault();                 // thwart the button's natural instincts
}

// look for a dictionary or create it if it's missing
function initDictionary(){
  console.log("Running initDictionary.");

  /*
    Look for an existing collection by asking apigee for a collection with our type
    If the collection doesn't exist, create it by creating the first entity
  */

  var myClient = getApigeeClient();
  var options = {
    type: collectionType,
    client: myClient
  };

  // Create a collection object to hold the response

  var collection = new Apigee.Collection(options);

  // Use a callback function to capture the response when we try to fetch the collection
  // http://apigee.com/docs/app-services/content/retrieving-collections

  collection.fetch(
    function(){ // success callback

      console.log("collection fetch success: " + this._list.length);

      // the returned data structure contains an array with the entities in the collection
      // if its length is zero, there are no entities and either there is no
      // collection of this type or the collection is empty.

      if (this._list.length > 0 ) {

        // the collection has an entity (i.e., dictionary already exists)
        // remember its UUID for later updates
        dictionaryUUID = this._list[0]._data.uuid;
        console.log ("Dictionary exists. UUID: " + dictionaryUUID);
        // now that we know we have a remote dictionary,
        getDictionary();  // update the local copy from the storage and display it

      } else {

        // either there is no collection of this type or the collection is empty.
        // we have to create a new entity (i.e., seed the dictionary)
        // if the collection doesn't exist, apigee will create one when 
        // we create the first entity

        var options = {
          type: collectionType,
          theDictionary: [{"word":"foo","def":"bar"}]
        };

        myClient.createEntity(options, function(error, result){
          if(error) {
            console.log ("Error creating the dictionary.");
          } else {
            // remember its UUID for later updates
            dictionaryUUID = result.entities[0].uuid;
            console.log ("Dictionary created. UUID: " + dictionaryUUID);
            // now that we know we have a remote dictionary,
            getDictionary();  // update the local copy from the storage and display it
          }
        });
      }

    }, 
    function(){ // failure callback for fetch
      console.log("collection fetch failure");
      // Somebody broke the internets!
    });
}

// draw the word list from the local storage
function displayLocalDictionary(){
  console.log("Running displayLocalDictionary.");
  $wordList = $('#wordList');       // cache the reference to speed up loop below
  $wordList.html(" ");				      // clear out the old contents
                                    // add all the entries from the dictionary to the list
  $.each(localDictionary, function(index, entry){	
    $wordList.append("<dt>" + entry.word + "</dt><dd>" + entry.def + "</dd>");
  });
}

// update the local copy of the dictionary from the remote and redisplay
function getDictionary(){
  console.log("Running getDictionary.");
  var options = {
    type: collectionType,
    uuid: dictionaryUUID
  };
  var myClient = getApigeeClient();
  myClient.getEntity(options, function (error, result) {
    if (error) {
      console.log("Error getting dictionary.");
    } else {
      // no error
      console.log("The server responded with: " + result.entities.length + " entities.");
      localDictionary = result.entities[0].theDictionary;
      displayLocalDictionary();
    }
  });
}

// save the local copy to the remote and redisplay
function saveDictionary(){
  console.log("Running saveDictionary.");
	var myClient = getApigeeClient();

  var properties = {
      client:myClient, 
      data:{
        type: collectionType,
        uuid: dictionaryUUID,
        theDictionary: localDictionary
      }
    };

    //Create a new entity object that contains the updated properties
    var entity = new Apigee.Entity(properties);
    // and save it
    entity.save(function (error,result) {
      if(error) {
        console.log ("Error saving the dictionary!");
      } else {
        console.log ("Apigee Saves!");
        // at this point, how do we know that the remote dictionary matches the local one?
        // We don't!
        // the server response contains a copy of what was saved. Perhaps we should
        // check that against the local copy?
      }
    });
}

// clear word list, clear the local copy, then save to the remote 
function clearDictionary(){
  console.log("Running clearDictionary.");
  localDictionary = []; // clear local 
  saveDictionary();     // update the remote storage from local copy
  $('#wordList').html(" ");
}


