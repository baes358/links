console.log('arena.js loaded ✅')


let channelSlug = 'video-game-interfaces-x9glzuoklq' // The “slug” is just the end of the URL.
let myUsername = 'sophia-bae-zsvqiaw7cdm' // For linking to your profile.




// First, let’s lay out some *functions*, starting with our basic metadata:
let placeChannelInfo = (channelData) => {
	// Target some elements in your HTML:
	let channelTitle = document.querySelector('#channel-title')
	let channelDescription = document.querySelector('#channel-description')
	let channelCount = document.querySelector('#channel-count')
	let channelLink = document.querySelector('#channel-link')

	// Then set their content/attributes to our data:
	channelTitle.innerHTML = channelData.title
	channelDescription.innerHTML = channelData.description ? channelData.description.html : ''
	channelCount.innerHTML = channelData.counts.blocks
	channelLink.href = `https://www.are.na/channel/${channelSlug}`
}

// declare function txtString
// take argument "value"
// This pattern was developed with assistance from an AI tool (ChatGPT) to safely normalize Are.na API text fields into renderable strings.
// It prevents "[object Object]" errors when API values are returned as nested objects (e.g., { html: "..." }).
// The process checks the values through if statements, and if they do not match any, it returns an empty string as the value.

let txtString = (value) => {

	// Defensive guard clause (pattern discussed with AI assistance, ChatGPT)
	// prevents runtime errors if expected DOM containers are missing.
	// if value has nothing, return empty string
	if (!value) return ''

	// if already a string, return string
 	if (typeof value === 'string') return value

	 // common Are.na shape: { html: "..." }
	if (typeof value === 'object' && value.html) return value.html

	// other possible shapes: { content: "..."} etc.
	if (typeof value === 'object' && value.content) return value.content

	// if no fits to previous types, return empty
	return ''
}


// Then our big function for specific-block-type rendering:
let renderBlock = (blockData) => {
	// To start, a shared `ul` where we’ll insert all our blocks
	let channelBlocks = document.querySelector('#channel-blocks')

	// Links!
	if (blockData.type == 'Link') {
		// Declares a “template literal” of the dynamic HTML we want.

		let linkItem =
			`
			<li class="content">
				${ blockData.title ? `<h3>${ blockData.title }</h3>` : '' }

				<figure>
					<picture>
						<source media="(width < 500px)" srcset="${ blockData.image.small.src_2x }">
						<source media="(width < 1000px)" srcset="${ blockData.image.medium.src_2x }">
						<img alt="${blockData.image.alt_text}" src="${ blockData.image.large.src_2x }">
					</picture>
					<span class="link-icon">
						${ blockData.source && blockData.source.url
							?
							`
							<a target="_blank" href="${ blockData.source.url }">
								<i class="fa-solid fa-link" aria-hidden="true"></i>
								
							</a>
							`
							: ''
						}

					</span>
					<figcaption>
						${ blockData.description ? blockData.description.html : ''}
					</figcaption>
				</figure>
			</li>
			`

		// And puts it into the page!
		channelBlocks.insertAdjacentHTML('beforeend', linkItem)

		// More on template literals:
		// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	}

	// Images!
	else if (blockData.type == 'Image') {
		// …up to you!
		// create image variable
		let imageItem = 

			// template literal -> multi-line string (Used AI tool, ChatGPT, to further break down and understand semantics of the condition)
			// ${...} -> evaluate JS and insert result here
			// blockData.title ? ... : ... -> ternary operator
				// if blockData.title exists, insert html
				// if not, insert empty string ''

			// blockData.source && blockData.source.url -> if blockData exists and has URL, expression is true
			// ? -> then
			// : '' -> else, if no source URL, insert ''
			// src="${ blockData.image.large.src_2x }"
				// large retina image URL
			// alt="${ blockData.image.alt_text || '' }">
				// || '' -> if alt_text is missing, use an empty string


			`
			<li class="content">
				${ blockData.title ? `<h3>${ blockData.title }</h3>` : '' }

				<img 
					src="${ blockData.image.large.src_2x }"
					alt="${ blockData.image.alt_text || '' }">
				<span class="link-icon">
					${ blockData.source && blockData.source.url
						?
						`
						<a target="_blank" href="${ blockData.source.url }">
                        	<i class="fa-solid fa-link" aria-hidden="true"></i>
							
						</a>
						`
						: ''
					}

				</span>
				
				
			

				
			</li>
			`

		channelBlocks.insertAdjacentHTML('beforeend', imageItem)


	}

	// Text!
	else if (blockData.type == 'Text') {
		// …up to you!
		// ${...} -> evaluate JS and insert result here
			// blockData.title ? ... : ... -> ternary operator
				// if blockData.title exists, insert html
				// if not, insert empty string ''

		// Content prioritization logic.

  		// The fallback chain below for the body variable (using logical OR operators, ||) was refined with AI (ChatGPT) to safely prioritize available API fields (content_html, content, description) without throwing errors.
		
		
		let body = 
			// or operator || -> return first true value
			// implements the txtString function defined outside of the renderBlock function, and it applies the conditions to different properties of blockData in the order stated below
			txtString(blockData.content_html) || txtString(blockData.content) || txtString(blockData.description)

			// if (blockData.content_html){
			// 	body = blockData.content_html
			// } else if (blockData.content){
			// 	body = blockData.content
			// } else if (blockData.description && blockData.description.html){
			// 	body = blockData.description.html
			// }
		

		// blockData.content_html ? blockData.content_html : (blockData.content ? blockData.content : '')

		let textItem =

			// if true, return title in h3 tags. if false, return empty
			`
			<li class="content">
				${ blockData.title ? `<h3>${ blockData.title}</h3>` : ''}

				${ body ? `<p class="txt">${ body }</p>` : ''}
			</li>

			`

			channelBlocks.insertAdjacentHTML('beforeend', textItem)
	}

	// Uploaded (not linked) media…
	else if (blockData.type == 'Attachment') {
		let contentType = blockData.attachment.content_type // Save us some repetition.

		// Uploaded videos!
		if (contentType.includes('video')) {
			// …still up to you, but we’ll give you the `video` element:
			let videoItem =
				`
				<li class="content">
					<p><em>Video</em></p>
					<video controls src="${ blockData.attachment.url }"></video>
				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', videoItem)

			// More on `video`, like the `autoplay` attribute:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
		}

		// Uploaded PDFs!
		else if (contentType.includes('pdf')) {
			// …up to you!
			let pdfItem =
			`
			<li class="content">
				${ blockData.title ? `<h3>${ blockData.title} </h3>` : `<h3>PDF</h3>`} 
			

				<p class="txt">
					<a target="_blank" href="${ blockData.attachment.url}">
						<i class="fa-solid fa-link" aria-hidden="true"></i>
					</a>
				</p>
			</li>
			`

			channelBlocks.insertAdjacentHTML('beforeend', pdfItem)
		}

		// Uploaded audio!
		else if (contentType.includes('audio')) {
			// …still up to you, but here’s an `audio` element:
			let audioItem =
				`
				<li class="content">
					${ blockData.title ? `<h3>${ blockData.title}</h3>` : `<h3>Audio</h3>`}
					
					<audio controls src="${ blockData.attachment.url }"></audio>
				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', audioItem)

			// More on`audio`:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
		}
	}

	// Linked (embedded) media…
	else if (blockData.type == 'Embed') {
		let embedType = blockData.embed.type

		// Linked video!
		if (embedType.includes('video')) {
			// …still up to you, but here’s an example `iframe` element:
			let linkedVideoItem =
				`
				<li class="content">
					${ blockData.title ? `<h3>${ blockData.title}</h3>` : `<h3>Video</h3>`}
					${ blockData.embed.html }
					${ blockData.description ? blockData.description.html : '' }

				</li>
				`

			channelBlocks.insertAdjacentHTML('beforeend', linkedVideoItem)

			// More on `iframe`:
			// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe
		}

		// Linked audio!
		else if (embedType.includes('rich')) {
			// …up to you!
			let linkedAudioItem =
			`
			<li class="content">
				${ blockData.title ? `<h3>${ blockData.title}</h3>` : `<h3>Audio</h3>`}
				${blockData.embed.html}
				${ blockData.description ? blockData.description.html : '' }

			</li>
			`

			channelBlocks.insertAdjacentHTML('beforeend', linkedAudioItem)
		}
	}
}



// A function to display the owner/collaborator info:

// inside address tag -> <img src="${ userData.avatar }">
let renderUser = (userData) => {
	let channelUsers = document.querySelector('#channel-users') // Container.

	// Defensive guard clause (pattern discussed with AI assistance, ChatGPT)
	// prevents runtime errors if expected DOM containers are missing.
	// to guard renderUser function from crashing
	if (!channelUsers) return


	let userAddress =
		`
		<address>
			<h3>${ userData.name }</h3>
			<p><a href="https://are.na/${ userData.slug }">Are.na profile ↗</a></p>
		</address>
		`
		

	channelUsers.insertAdjacentHTML('beforeend', userAddress)
}




// Finally, a helper function to fetch data from the API, then run a callback function with it:
let fetchJson = (url, callback) => {
	fetch(url, { cache: 'no-store' })
		.then((response) => response.json())
		.then((json) => callback(json))
}

// More on `fetch`:
// https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch



// Now that we have said all the things we *can* do, go get the channel data:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}`, (json) => {
	console.log(json) // Always good to check your response!

	placeChannelInfo(json) // Pass all the data to the first function, above.
	renderUser(json.owner) // Pass just the nested object `.owner`.
})

// Get your info to put with the owner's:
fetchJson(`https://api.are.na/v3/users/${myUsername}/`, (json) => {
	console.log(json) // See what we get back.

	renderUser(json) // Pass this to the same function, no nesting.
})

// And the data for the blocks:
fetchJson(`https://api.are.na/v3/channels/${channelSlug}/contents?per=100&sort=position_desc`, (json) => {
	console.log(json) // See what we get back.

	// Loop through the nested `.data` array (list).
	json.data.forEach((blockData) => {
		// console.log(blockData) // The data for a single block.

		renderBlock(blockData) // Pass the single block’s data to the render function.
	})
})
