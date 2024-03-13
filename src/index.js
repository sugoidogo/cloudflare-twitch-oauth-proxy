// @ts-ignore
import token_module from '../static/TwitchAuth.mjs'
// @ts-ignore
import twurple_module from '../static/SugoiAuthProvider.mjs'
// @ts-ignore
import code_html from '../static/code.html'

/**
 * create a Response object with control headers set
 * @param {BodyInit} body 
 * @param {ResponseInit} init 
 */
function makeResponse(body=undefined,init=undefined){
	if(!init){
		init={}
	}
	if(!init.headers){
		init.headers={}
	}
	init.headers['access-control-allow-origin']='*'
	init.headers['access-control-allow-private-network']='true'
	init.headers['cache-control']='no-cache,private'
	return new Response(body,init)
}

export default {
	/**
	 * @param {Request} request 
	 * @param {Object} env 
	 */
	async fetch(request, env) {
		if(request.method==='OPTIONS'){
			return makeResponse()
		}

		const url=new URL(request.url)

		if(url.pathname==='/favicon.ico'){
			return new Response(undefined,{status:204})
		}

		if(url.pathname==='/code.html'){
			return makeResponse(code_html,{
				headers:{'content-type':'text/html'}
			})
		}

		if(url.pathname==='/TwitchAuth.mjs'){
			// @ts-ignore
			return makeResponse(token_module,{
				headers:{'content-type':'text/javascript'}
			})
		}

		if(url.pathname==='/SugoiAuthProvider.mjs'){
			// @ts-ignore
			return makeResponse(twurple_module,{
				headers:{'content-type':'text/javascript'}
			})
		}

		if(url.pathname!=='/oauth2/token'){
			return makeResponse(undefined,{status:404});
		}

		const requestBody=await request.formData()

		if(!requestBody.has('client_id')){
			return makeResponse('missing client_id',{status:401})
		}

		const client_secret=await env.config.get(requestBody.get('client_id'))

		if(client_secret===null){
			return makeResponse(null,{status:403})
		}

		requestBody.append('client_secret',client_secret)
		return await fetch('https://id.twitch.tv/oauth2/token',{
			method:'POST',
			body:requestBody
		})
	},
};
