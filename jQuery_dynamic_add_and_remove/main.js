$(function() {
    //ADD
  $(document).on('click', '#add-new', function(event){ 
    event.preventDefault();
    var new_dynamic_item = $('.dynamic-list-item:first').clone(); 
    $(".dynamic-list-container").append(new_dynamic_item);
        
    //clear all in dynamic-list-item:last 
    $(':input', '.dynamic-list-item:last')
      .removeAttr('checked')
      .removeAttr('selected')
      .not(':button, :submit, :reset, :hidden, :radio, :checkbox')
      .val('');
  });
  //Clone
  $(document).on('click', '.clone-one', function(event){
    event.preventDefault();
    var new_dynamic_item = $(this).parent().clone();
    $(".dynamic-list-container").append(new_dynamic_item);
  });
  //remove
  $(document).on('click', '.remove-one', function(event) {
    event.preventDefault();
    $(this).closest($(this)).parent().remove();
  });
  
  $('.drag-handle').css('cursor', 'move'); //滑鼠標
  //failing
  //drag need jquery UI Sortable
  //https://jqueryui.com/sortable/
});
