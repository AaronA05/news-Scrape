$("#scrape-now").on("click", function(){
	
	$.post("/scrape", {}, function(data){
		location.reload();
	})
});

$(".save-now").on("click", function(){


	var thisId = $(this).attr("data-id");


	$.ajax({
		method: "GET",
		url: "article/" + thisId
	})
	.done(function(data){
	
	})

});

//add-note should trigger a modal
//save-note should trigger the call to the database
$(".add-note").on("click", function(){
	console.log("Note Clicked");
	var thisNewId = $(this).attr('data-noteID');
	console.log(thisNewId);

	$('#save-note').on('click', function(){
		console.log(thisNewId);
		$.ajax({
			method: "POST",
			url: "notes/" + thisNewId,
			data:{
				body: $("#comment").val()
			}

		}).done(function(data){
			console.log(data);
			$("#comment").empty();
		})
		thisNewId = '';
	});

});

$(".view-comment").on("click", function(){
	var thisId = $(this).attr('data-id');
	console.log(thisId);

	$(".comments").empty();

	$.ajax({
		method: "GET",
		url: 'allNotes/' + thisId
	})
	.done(function(data){
		console.log("+++++++++++++++");
		// console.log(data);
		// console.log(data[0].note);
		var artId = data._id;
		var noteId = data.note;

		console.log(artId);
		console.log(noteId);

		$.ajax({
			method: "GET",
			url: 'viewNotes/' + noteId
		})
		.done(function(data){
			var articleDiv = $("#" + artId);
			var commentDiv = $("<div>");
			commentDiv.attr('class', 'comments')
			commentDiv.append("<p>" + data.body + "</p>");
			articleDiv.append(commentDiv);
		});

	})
})


$(".remove-item").on("click", function(){

	var thisId = $(this).attr('data-id');

	$.ajax({
		method: "GET",
		url: 'remove/' + thisId
	})
	.done(function(data){

	});
	location.reload();
})


