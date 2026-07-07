-- CreateIndex
CREATE UNIQUE INDEX "companies_account_id_key" ON "companies"("account_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_account_id_key" ON "users"("account_id");
