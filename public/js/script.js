$(document).ready(function(){

	var delAnswer = false;
	$(".delete").on("click", function(e){
		e.preventDefault();

		var self = this, 
			data = {};
		data.delAnswer = confirm("Вы уверены?"),
		data.id = $(this).data('id');

		if (data.delAnswer) {
			$.ajax({
	            type: 'POST',
	            url: '/admin*',
	            data: data
        	})
        	.done(function(data){   
        		try {
				if ('error' in data) {
					alert('Не удалось удалить!!! Ошибка:' + data.error);
				} else {
					$(self).closest('tr').remove();
				}
				} catch (e) {
					alert('Не удалось удалить!');
				}
			});
		}		
	});


	$('pre code').each(function(i, block) {
	    hljs.highlightBlock(block);
	});

	$(".j-toggle-task").on("click", function(e){
		e.preventDefault();
		var $this = $(this),
			$task = $this.next(),
			$icon = $this.children(".j-icon_toggle");

		if ( $task.hasClass("dNone") ) {
			$task.removeClass("dNone");
			$icon.removeClass("fa-angle-down").addClass("fa-angle-up");
		} else {
			$task.addClass("dNone");
			$icon.removeClass("fa-angle-up").addClass("fa-angle-down");
		}
	})


})