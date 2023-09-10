build:
	docker build -t botasist .

run:
	docker run -d -p 3000:3000 --name botasist --rm botasist