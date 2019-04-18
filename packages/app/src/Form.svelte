<div>
	<h1>A Form component</h1>
	<h2>Person</h2>
	<ul>
		<li>name: {p.name}</li>
		<li>age: {p.age}</li>
		<li>phone: {p.phone}</li>
	</ul>
</div>

<script lang="ts">
	const x: number = "xxx";

	interface Person {
		name: string;
		age: number;
		phone?: string;
	}

	const p: Person = {
		name: "Alice",
		age: 18
	};
	const b: Person = {
		age: "bad"
	};
</script>
