var d = new Array(); // local dictionary

// in the following code, we try to keep the storage up to date as 
// we updatethe local copy of the dictionary

$(document).ready( function(){

  // This is synchronous code - it expects getDictionary() to return immediately with a new value
  d = getDictionary(); // update the local copy from the storage
  displayDictionary(d); // update the DOM from the local copy

  $("#addButton").click(addWord); 
  
  $("#clearButton").click(function(){
    d = [];               // clear local 
    saveDictionary(d);    // update the storage from local copy
    displayDictionary(d); // update the DOM from the local copy
    $('#wordList').html(" ");
  });
});

function addWord (e){
  // get form contents, add it to the dictionary, save dictionary, display dictionary
  var entry={};
  entry.word = $("#word").val();						    // get values from form
  entry.definition = $("#definition").val();
  d.push(entry);				                        // update local dictionary 
  saveDictionary(d);		                        // store it
  displayDictionary(d);                         // update DOM
  e.preventDefault();		                        // thwart the button's natural instincts
}

function displayDictionary(d){
  $wordList = $('#wordList');       // cache the reference to speed up loop below
  $wordList.html(" ");				      // clear out the old contents
                                    // add all the entries from the dictionary to the list
  $.each(d, function(index, entry){	
    $wordList.append("<dt>" + entry.word + "</dt><dd>" + entry.definition + "</dd>");
  });
}

function getDictionary(){
  if (localStorage.getItem('theDictionary') === null) {  
    return([]);  // if nothing is stored, return an empty data structure
  }  else {       // if there is something, return it
    return(JSON.parse(localStorage.getItem('theDictionary')));
  }
}

function saveDictionary(d){
	localStorage.setItem('theDictionary', JSON.stringify(d)); 
}

