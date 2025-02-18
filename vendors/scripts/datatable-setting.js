$('document').ready(function(){
    var table = $('.data-table').DataTable({
        scrollCollapse: true,
        autoWidth: false,
        responsive: true,
        dom: "lftip", // Ẩn ô tìm kiếm mặc định
        columnDefs: [{
            targets: "datatable-nosort",
            orderable: false,
        }],
        "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tất cả"]],
        "language": {
            "lengthMenu": "Hiển thị _MENU_ dòng",
            "info": "_START_ - _END_ của _TOTAL_ dòng",
            "search": "Tìm kiếm:",
            "paginate": {
                "next": '<i class="ion-chevron-right"></i>',
                "previous": '<i class="ion-chevron-left"></i>'
            }
        }
    });

    // Xử lý tìm kiếm theo cột
    $('#searchInput').on('keyup', function() {
        var column = $('#searchFilter').val();
        var searchText = $(this).val();

        table.search('').columns().search('').draw(); 

        if (column === "all") {
            table.search(searchText).draw();
        } else {
            table.column(column).search(searchText).draw();
        }
    });

    $('.dataTables_filter').remove();
	$('.data-table-history').DataTable({
		scrollCollapse: true,
		autoWidth: false,
		responsive: true,
		columnDefs: [{
			targets: "datatable-nosort",
			orderable: false,
		}],
		"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "Tất cả"]],
		"language": {
			"lengthMenu": "Hiển thị _MENU_ dòng",
			"info": "Hiển thị _START_ - _END_ của _TOTAL_ dòng",
			"search": "Tìm kiếm:",
			"paginate": {
				"next": '<i class="ion-chevron-right"></i>',
				"previous": '<i class="ion-chevron-left"></i>'
			}
		},
	});

    // Xử lý chọn hàng trong bảng
    $('.data-table tbody').on('click', 'tr', function () {
        $(this).toggleClass('selected-row');
    });

});


