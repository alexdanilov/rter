package main

import (
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
)

func main() {
	multipartUpload()
}

func multipartUpload() {
	fmt.Println("Ready")
	fmt.Println("Set")

	pipeReader, pipeWriter := io.Pipe()
	defer pipeReader.Close()
	multipartWriter := multipart.NewWriter(pipeWriter)

	contentType := multipartWriter.FormDataContentType()
	fmt.Println(contentType)

	responseChannel := make(chan *http.Response)

	go func() {
		response, error := http.Post("http://localhost:8080/multiup", contentType, pipeReader)
		checkError(error)
		responseChannel <- response
	}()

	multipartFileWriter, error := multipartWriter.CreateFormFile("image", "tomato.png")
	checkError(error)
	
	imageFile, error := os.Open("cat.png")
	checkError(error)
	defer imageFile.Close()
	
	io.Copy(multipartFileWriter, imageFile)
	multipartWriter.Close()
	pipeWriter.Close()

	response := <-responseChannel
	fmt.Println(response)
	fmt.Println("Fire")
}

func regularUpload() {
	fmt.Println("Ready")
	fmt.Println("Set")

	imageFile, error := os.Open("cat.png")
	checkError(error)
	defer imageFile.Close()

	response, error := http.Post("http://localhost:8080/upload", "image/png", imageFile)
	checkError(error)

	fmt.Println(response)

	fmt.Println("Fire")
}

func checkError(error error) {
	if error != nil {
		panic(error)
	}
}
