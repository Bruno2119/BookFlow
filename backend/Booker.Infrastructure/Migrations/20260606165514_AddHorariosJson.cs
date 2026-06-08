using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Booker.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddHorariosJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HorariosJson",
                table: "Negocios",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HorariosJson",
                table: "Negocios");
        }
    }
}
