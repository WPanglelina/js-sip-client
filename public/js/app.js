(function(){
	window.onload = function(){
		//localStorage
		var _user = localStorage.getItem('username');
		var _pass = localStorage.getItem('password');
		var _calluser = localStorage.getItem('calluser');
		if(_user !== 'null') $('input[name=username]').val(_user);
		if (_pass !== 'null') $('input[name=password]').val(_pass);
		if (_calluser !== 'null') $('input[name=calluser]').val(_calluser);

	    $('#btn-reg').click(function(){
	    	app.register();
	    });
	    $('#btn-call').click(function(){
	    	app.call();
	    });
	}

	var app = window.app = {
		ws_servers: null,
		session: null,
		server: null,
		username: null,
		password: null,

		register : function(){
			server = $('input[name=server]').val();
			username = $('input[name=username]').val();
			password = $('input[name=password]').val();

			if(server === '' || username === '' || password === '') return alert('请补全注册信息');
			this.localStorage(username,password);
			ws_servers = 'ws://101.200.187.190:5080';
			var uri = 'sip:'+ username+'@'+server;
			var configuration = {
			    'ws_servers': ws_servers,
			    'uri': uri,
			    'password': password
			};
			Sip.init(configuration);
		},

		call : function(){
			var calluser = $('input[name=calluser]').val();
			if(calluser === '') return alert('请补全被叫方信息');
			var sipurl = 'sip:'+ calluser+'@'+server;
			session = Sip.call(calluser);
		},
		localStorage: function(username,password){
			localStorage.setItem('username',username);
			localStorage.setItem('password',password);
		}
	}
})();