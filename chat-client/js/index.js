(function(){
  
  var chat = {
    messageToSend: '',
    messageResponses: [
      'Why did the web developer leave the restaurant? Because of the table layout.',
      'How do you comfort a JavaScript bug? You console it.',
      'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
      'What is the most used language in programming? Profanity.',
      'What is the object-oriented way to become wealthy? Inheritance.',
      'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol'
    ],
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
        // responses
        var templateResponse = Handlebars.compile( $("#message-response-template").html());
        var contextResponse = { 
          response: this.getRandomItem(this.messageResponses),
          time: this.getCurrentTime()
        };
        
        setTimeout(function() {
          this.$chatHistoryList.append(templateResponse(contextResponse));
          this.scrollToBottom();
        }.bind(this), 1500);
        
      }
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();         
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
  };
  
  chat.init();
  
  var searchFilter = {
    options: { valueNames: ['name'] },
    init: function() {
      var userList = new List('people-list', this.options);
      var noItems = $('<li id="no-items-found">No items found</li>');
      
      userList.on('updated', function(list) {
        if (list.matchingItems.length === 0) {
          $(list.list).append(noItems);
        } else {
          noItems.detach();
        }
      });
    }
  };
  
  searchFilter.init();
  
})();

function fetchGroups() {
  var url = 'http://localhost:3030/groups';
  var token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImIyODk2MzFhLTAzN2EtNDE3OC05M2Y2LTNiN2VmYzY3ZjI0OSIsInVzZXJuYW1lIjoiNkBnbWFpbC5jb20iLCJyb2xlIjoibm9ybWFsIiwiaWF0IjoxNTM0MDYwODU5LCJleHAiOjE1MzQwNjQ0NTl9.S_vwO_fT6Itln_3rI_5ZaH-Cr3i6UzXfiXwQYfzJBsrB0eQRLr_w35zogYkg-eErjgASa0P5mt46OyvLgnX8kv0iYL9rFOW0NSHGnDG6dkLfhaCCPDe7t8yze2jgR9YQ9YUshzbXwWXKkOIaT9ApuTnBhlMLktzdxUc0iT1VXUI';
  request(url, token, 'GET', null, function(error, groups) {
    if (error) {
      console.log(error);
      alert('Have something wrong!');
    } else {
      var listGroups = groups.data;
      if (listGroups.length === 0) {
        console.log('Group empty');
      } else {
        document.getElementById('list-groups').innerHTML = '';
        for (const item of listGroups) {
          var li = document.createElement('li');
          var successLB = '<span class="label label-success">Available</span>';
          var warningLB = '<span class="label label-warning">Not Available</span>';
          li.innerHTML = `
          <li class="clearfix">
          <img src="images/chat_avatar_10.jpg" alt="avatar" />
          <div class="about">
            <div class="name">${item.name}</div>
            <div class="status">
              <i class="fa fa-circle online"></i> online
            </div>
          </div>
          </li>
          `;
          document.getElementById('list-groups').append(li);
        }
      }
    }
  });
};

function request(url, token, method, data, callback) {
  $.ajax({
    headers: { "Authorization": 'Bearer ' + token },
    url: url,
    data: (data !== null) ? JSON.stringify(data) : data,
    contentType: 'application/json; charset=utf-8',
    error: function(error) {
      callback(error);
    },
    success: function(data) {
      callback(null, data);
    },
    type: method
  });
};

function showLoading(isDisplay) {
  if(isDisplay) {
    $('#tbl-container').hide();
    $('.cls-showLoading').show();
  } else {
    $('#tbl-container').show();
    $('.cls-showLoading').hide();
  }
}
