export default function morph(node, params) {
	const {
			delay = 0,
			duration = 400,
			easing = t => 1 - Math.pow(1 - t, 3),
			from = { left: 0, top: 0, width: 0, height: 0 }
		} = params,
		to = node.getBoundingClientRect(),
		ty = from.top - to.top,
		tx = from.left - to.left,
		sx = from.width / to.width - 1,
		sy = from.height / to.height - 1;

	return {
		delay,
		easing,
		duration,
		css: (t, u) => {
			return `
				transform: 
					translate(${u * tx}px, ${u * ty}px) 
					scale(${1 + u * sx}, ${1 + u * sy});
			`;
		}
	};
}