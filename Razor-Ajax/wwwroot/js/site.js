$(document).ready(function () {
    $('#viewAll').load('?handler=ViewAllPartial');
});

var placeholderElement = $('#modal-placeholder');

$('button[data-toggle="ajax-modal"]').click(function (event) {
    var url = $(this).data('url');
    $.get(url).done(function (data) {
        placeholderElement.html(data);
        placeholderElement.find('.modal').modal('show');
    });
});

placeholderElement.on('click', '[data-save="modal"]', function (event) {
    event.preventDefault();

    var form = $(this).parents('.modal').find('form');
    var actionUrl = form.attr('action');
    var dataToSend = form.serialize();

    $.post(actionUrl, dataToSend).done(function (data) {
        var newBody = $('.modal-body', data);
        placeholderElement.find('.modal-body').replaceWith(newBody);
        var isValid = newBody.find('[name="IsValid"]').val() == 'True';
        if (isValid) {
            var book = new Object();
            book.Name = $("#name").val();
            book.ISBN = $("#isbn").val();
            book.Author = $("#author").val();
            AddData(book);
        }
    });
});

placeholderElement.on('click', '[data-edit="modal"]', function (event) {
    event.preventDefault();

    var form = $(this).parents('.modal').find('form');
    var actionUrl = form.attr('action');
    var dataToSend = form.serialize();
    $.post(actionUrl, dataToSend).done(function (data) {
        var newBody = $('.modal-body', data);
        placeholderElement.find('.modal-body').replaceWith(newBody);
        var isValid = newBody.find('[name="IsValid"]').val() == 'True';
        if (isValid) {
            var book = new Object();
            var bookId = $("#id").val();
            book.Name = $("#name").val();
            book.ISBN = $("#isbn").val();
            book.Author = $("#author").val();
            UpdateData(book, bookId);
        }
    });
});

//CREATE: Add new data with ajax
function AddData(book) {
    $.ajax({
        url: "/Index?handler=AddBook",
        type: "POST",
        data: JSON.stringify(book),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        beforeSend: function (xhr) {
            xhr.setRequestHeader("MY-AMDT-TOKEN",
                $('input:hidden[name="__RequestVerificationToken"]').val());
        },
        success: function (response) {
            if (response != null) {
                placeholderElement.find('.modal').modal('hide');
                toastr.success(response, "Success Create");
                $('#viewAll').load('?handler=ViewAllPartial');
                $("input[type=text]").val("");
            } else {
                alert("Something went wrong");
            }
        },
        failure: function (response) {
            alert(response.responseText);
        },
        error: function (response) {
            alert(response.responseText);
        }
    });
}

//UPDATE: Edit/Update data with ajax
function EditData(data, Id) {
    var id = Id;
    var name = $(data).closest('tr').find('td:eq(0)').text();
    var isbn = $(data).closest('tr').find('td:eq(1)').text();
    var author = $(data).closest('tr').find('td:eq(2)').text();
    var book = new Object();
    book.Id = id;
    book.Name = name;
    book.ISBN = isbn;
    book.Author = author;

    var url = "/Index?handler=GetBookPartial";
    $.get(url, book).done(function (data) {
        placeholderElement.html(data);
        placeholderElement.find('.modal').modal('show');
    });
}

function UpdateData(book, bookId) {
    if (book != null) {
        $.ajax({
            url: "/Index?handler=UpdateBook&bookId=" + bookId,
            type: "PUT",
            data: JSON.stringify(book),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            beforeSend: function (xhr) {
                xhr.setRequestHeader("MY-AMDT-TOKEN",
                    $('input:hidden[name="__RequestVerificationToken"]').val());
            },
            success: function (response) {
                $('#viewAll').load('?handler=ViewAllPartial');
                placeholderElement.find('.modal').modal('hide');
                toastr.success(response, "Success Update");
            },
            failure: function (response) {
                alert(response.responseText);
            },
            error: function (response) {
                alert(response.responseText);
            }
        });
    }
}

//DELETE: Delete data with ajax
function DeleteData(bookId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't delete this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: "/Index?handler=DeleteBook&bookId=" + bookId,
                type: "DELETE",
                dataType: "json",
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("MY-AMDT-TOKEN",
                        $('input:hidden[name="__RequestVerificationToken"]').val());
                },
                success: function (response) {
                    toastr.success(response, "Success Deleted");
                    $('#viewAll').load('?handler=ViewAllPartial');
                },
                error: function (errormessage) {
                    alert(errormessage.responseText);
                }
            });
        }
    });
}