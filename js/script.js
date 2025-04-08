$(document).ready(function() {
	
	const urlListFiles = "http://localhost:8080/apigd/v1/drive/listar-arquivos-pasta/1gNXM8gbJT7zafvxDNcgqVk8ni0f_XlJa";
	const urlViewMetadataFile = "http://localhost:8080/apigd/v1/drive/visualizar-metadados-arquivo/";
	const urlDownloadFiles = "http://localhost:8080/apigd/v1/drive/baixar-arquivo/";
	const urlDeleteFile = "http://localhost:8080/apigd/v1/drive/excluir-arquivo/";
	const methodDelete = "DELETE"; 
	const methodGet = "GET";
	
	Swal.fire({
		
		title: "Listando arquivos.. Aguarde!",
		allowOutsideClick: false,
		showConfirmButton: false,
		didOpen: () => {
			
			Swal.showLoading();
			
			$.ajax({
		
				url: urlListFiles,
				method: methodGet,
				dataType: "json",
				success: function(data) {
					
					const tabela = $("#tblArquivos");
					const tbody = tabela.find("tbody");
					
					tbody.empty();
					
					$.each(data, function(index, item) {
						
						const linha = $("<tr>");
						
						linha.append($("<td>").text(item.id));
						linha.append($("<td>").text(item.name));
						
						const downloadButton = $("<button>").attr("type", "button").addClass("btn btn-sm btn-primary style-buttons").text("Download").on("click", function() {
							
							Swal.fire({
								
								title: "Baixando arquivo.. Aguarde!",
								allowOutsideClick: false,
								showConfirmButton: false,
								didOpen: () => {
									
									Swal.showLoading();
									
									$.ajax({
								
										url: urlDownloadFiles + item.id,
										method: methodGet,
										xhrFields: {
											responseType: "blob"
										},
										success: function(data, status, xhr) {
											
											const disposition = xhr.getResponseHeader('Content-Disposition');
											var filename = "";
											
											if (disposition && disposition.indexOf("attachment") !== -1) {
												
											const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/gi;
											const matches = filenameRegex.exec(disposition);
											
											if (matches != null && matches[1]) {
												
												filename = matches[1].replace(/['"]/g, '');
											}
											
											} else {
											
												filename = item.name || 'arquivo_baixado';
										  
											}
										
											const a = document.createElement("a");
											const url = window.URL.createObjectURL(data);
										
											a.href = url;
											a.download = filename;
											document.body.append(a);
											a.click();
											a.remove();
										
											window.URL.revokeObjectURL(url);
											
											Swal.close();
											
										},
										error: function(error) {
											
											console.log("Houve erro ao baixar o arquivo. Error: ", error);
											
											Swal.fire({
											
												icon: "error",
												title: "Erro!",
												text: "Houve erro ao baixar o arquivo."
												
											});
											
											Swal.close();
											
										}
										
									});
									
								}
								
							});
							
						});
						
						const viewButton = $("<button>").attr("type", "button").addClass("btn btn-sm btn-primary style-buttons").text("Visualizar").on("click", function() {
							
							$.ajax({
								
								url: urlViewMetadataFile + item.id,
								method: methodGet,
								dataType: "json",
								success: function(data, status, xhr) {
									
									window.open(data.webViewLink, "_blank");
									
								},
								error: function(error) {
											
									console.log("Houve erro ao visualizar o arquivo. Error: ", error);
									
									Swal.fire({
										
										icon: "error",
										title: "Erro!",
										text: "Houve erro ao visualizar o arquivo."
										
									});
									
								}
								
							});
							
						});
						
						const deleteButton = $("<button>").attr("type", "button").addClass("btn btn-sm btn-primary style-buttons").text("Excluir").on("click", function() {
							
							const swalWithBootstrapButtons = Swal.mixin({
								
								customClass: {
									
									confirmButton: "btn btn-success",
									cancelButton: "btn btn-danger"
									
								},
								buttonsStyling: false
								
							});
							
							swalWithBootstrapButtons.fire({
								
								title: "Confirma a exclusão?",
								text: "O arquivo será excluído permanentemente do seu Drive!",
								icon: "warning",
								showCancelButton: true,
								confirmButtonText: "Sim, confirmo!",
								cancelButtonText: "Não, cancela!",
								reverseButtons: true
								
							}).then((result) => {
								
								if (result.isConfirmed) {
									
									$.ajax({
								
										url: urlDeleteFile + item.id,
										method: methodDelete,
										dataType: "json",
										success: function(data, status, xhr) {
											
											swalWithBootstrapButtons.fire({
												
												icon: "success",
												title: data.statusRequest,
												text: data.statusMessage
												
											}).then(() => {
												
												window.location.reload(true);
												
											});
											
										},
										error: function(error) {
													
											console.log("Houve erro ao excluir o arquivo. Error: ", error);
											
											Swal.fire({
												
												icon: "error",
												title: "Erro!",
												text: "Houve erro ao excluir o arquivo."
												
											});
											
										}
										
									});
									
								} else if (result.dismiss === Swal.DismissReason.cancel) {
									
									swalWithBootstrapButtons.fire({
										
										title: "Exclusão cancelada!",
										text: "Seu arquivo continuará no Drive.",
										icon: "error"
										
									});
									
								}
								
							});
							
						});
						
						linha.append($("<td>").append(downloadButton).append("&nbsp;").append(viewButton).append("&nbsp;").append(deleteButton));
						
						tbody.append(linha);
						
						$("#contador-registros").text("Total de arquivos: " + data.length);
						
						Swal.close();
						
					});
					
				},
				error: function(jqXHR, status, error) {
					
					console.log("Houve erro ao listar os arquivos: ", status, error);
					
					Swal.fire({
						
						icon: "error",
						title: "Erro!",
						text: "Houve erro ao listar os arquivos."
						
					});
					
					Swal.close();
					
				}
				
			});
			
		}
		
	});
	
});