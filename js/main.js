$(document).ready( function(){
  displayDictionary();
  $("#addButton").click(addWord); 
  
  $("#clearButton").click(function(){
    localStorage.removeItem('theDictionary');
    $('#wordList').html(" ");
  });
});


function addWord (e){
  // get form contents, add it to the dictionary, save dictionary, display dictionary
  var entry={};
  entry.word = $("#word").val();						// get values from form
  entry.definition = $("#definition").val();
  
  var dictionary = getDictionary();	// basic update cycle: read...
  dictionary.push(entry);				// update by adding entry to dictionary...
  saveDictionary(dictionary);		// write to local storage...
  displayDictionary();				// display the resulting new dictionary...
  e.preventDefault();				// thwart the button's natural instincts
}

function displayDictionary(){
  var d = getDictionary();			// read from local storage or init an empty dictionary
  $wordList = $('#wordList');		// cache the reference to speed up loop below
  $wordList.html(" ");				 // clear out the old contents
  // add all the entries from the dictionary to the list
  $.each(d, function(index, entry){	
    $wordList.append("<dt>" + entry.word + "</dt><dd>" + entry.definition + "</dd>");
  });
}

function getDictionary(){
  if (localStorage.getItem('theDictionary') === null) { 
    // if nothing is stored, return an empty data structure
    return([]);
  }  else { 
    // if there is something, return it
    return(JSON.parse(localStorage.getItem('theDictionary')));
  }
}

function saveDictionary(d){
	localStorage.setItem('theDictionary', JSON.stringify(d)); 
}