(function() {
  var tasks = {};
  $(document).ready(function() {
    if(localStorage.getItem("tasks") != null) {
      tasks = JSON.parse(localStorage.getItem("tasks"));
    }
    if(tasks == null || tasks.length < 1) {
      $('#timers').html("<div class='row-fluid'><div class='col-md-12'><p class='no-timers'>No Timers Found</p></div></div>");
    }
    else {
      $.each(tasks,function(index,task) {
        var extra = ''
        var totalTime = 0;
        var ds;
        $('#timers').append("<div class='row-fluid' id='" + index + "'></div>");
        var item = $('#' + index);
        item.append("<div class='col-md-8 description'>" + task.description + "</div>");
        if(task.start != null) {
          extra = "running";
          ds = "data-start='" + task.start + "'";
          totalTime = task.totalTime + (Date.now()-task.start);
        }
        else {
          totalTime = task.totalTime;
        }
        item.append("<div class='col-md-2 time " + extra + "' " + ds + " data-time='" + totalTime + "'>" + friendlyTime(totalTime) + "</div>");
        if(task.start != null) {
          item.append("<div class='col-md-2 timer-toggle'><button class='btn btn-danger' data-action='stop'>Stop</button></div>");
        }
        else {
          item.append("<div class='col-md-2 timer-toggle'><button class='btn btn-success' data-action='start'>Start</button></div>");
        }
      });
      assignAction();
    }

    $('#startTimer').click(function() {
      $('.no-timers').remove();
      var tid = Number(Date.now()).toString(16)
      tasks[tid] = {
        start: Date.now(),
        totalTime: 0,
        description: ''
      }
      $('#timers').append("<div class='row-fluid' id='" + tid + "'></div>");
      var item = $('#'+tid);
      item.append("<div class='col-md-8 description blank'>Click to add a description</div>");
      item.append("<div class='col-md-2 time running' data-time='0' data-start='" + Date.now() + "'>00:00:00</div>");
      item.append("<div class='col-md-2 timer-toggle'><button class='btn btn-danger' data-action='stop'>Stop</button></div>");
      assignAction();
    });
  });

  function friendlyTime(ms) {
    var rawSeconds = Math.round(ms/1000,0)
    var rawMinutes = Math.floor(rawSeconds/60,0); //turn the time into minutes
    var hours = Math.floor(rawMinutes/60); //devide into hours, floor the amount since we'll count it in minutes
    var minutes = rawMinutes%60 //find the minutes by getting the remainder after hours division
    var seconds = rawSeconds%60
    if(hours < 10) {
      hours = "0"+hours //if hours is less then 10 we'll add a leading zero to make it look nice
    }
    if(minutes < 10) {
      minutes = "0"+minutes //we'll add the same leading zero to minutes.
    }
    if(seconds < 10) {
      seconds = "0"+seconds
    }
    hours = hours.toString();
    if(hours.length > 3) {
      //add hundreds seperator, this only applies to hours since the max minutes can be is 59
      var temp = hours;
      hours = "";
      /**
        we've applied the hours figure to temp so we can refill hours with the formatted string
        we'll work backwards through the string, 3 characters at a time adding a comma to the beginning
        after that we'll take the difference that wasn't accounted for in our loop and add it to the beginning
        if there is no difference we'll parse the comma off
      **/
      for(a = temp.length;a >= 3;a-=3) {
        hours = ","+temp.substring(a-3,a)+hours;
      }
      if(temp.length%3 == 0) {
        hours = hours.substring(1);
      }
      else {
        hours = temp.substring(0,temp.length%3)+hours;
      }
    }
    return hours+":"+minutes+":"+seconds;
  }

  function assignAction() {
    $('.timer-toggle BUTTON').click(function() {
      var item = $(this).parent().parent();
      var id = item.attr('id');
      if($(this).data('action') == "stop") {
        tasks[id].totalTime += Date.now()-tasks[id].start;
        tasks[id].start = null;
        tasks[id].description = $('.description',item).text();
        $(this).removeClass('btn-danger');
        $(this).addClass('btn-success');
        $(this).text('Start');
        $(this).data('action','start');
        $('.time',item).removeClass('running');
        $('.time',item).data('time',tasks[id].totalTime);
      }
      else {
        tasks[item.attr('id')].start = Date.now();
        $(this).removeClass('btn-success');
        $(this).addClass('btn-danger');
        $(this).text('Stop');
        $(this).data('action','stop');
        $('.time',item).addClass('running');
        $('.time',item).data('start',Date.now());
        $('.time',item).data('time',tasks[item.attr('id')].totalTime);
        console.log(tasks[item.attr('id')].start);
      }
      saveTimers();
    });
  }
  function saveTimers() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  window.setInterval(function() {
    $(".time.running").each(function() {
      $(this).text(friendlyTime($(this).data('time') + (Date.now()-$(this).data('start'))));
    });
  },1000)
})();
