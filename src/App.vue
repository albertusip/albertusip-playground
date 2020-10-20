<template>
    <v-app>
        <v-app-bar
        app
        color="primary"
        dark
        >
        <div class="d-flex align-center">
            Albertusip Playground
        </div>
        </v-app-bar>

        <v-main>
            <v-container class="mt-5">
                <v-card>
                    <v-card-title
                        class="pb-0"
                    >
                        <v-row justify="space-between">
                            <v-col
                                cols="12"
                                sm="6"
                            >
                                <v-text-field
                                    v-model="search"
                                    autocomplete="off"
                                    clearable
                                    append-icon="mdi-magnify"
                                    label="Search"
                                    single-line
                                    hide-details
                                />
                            </v-col>
                        </v-row>
                    </v-card-title>
                    <v-data-table
                        :headers="headers"
                        :items="tableItems"
                        :options.sync="options"
                        :page.sync="page"
                        :server-items-length="totalTableItems"
                        :loading="loadingTable"
                        :footer-props="{
                            itemsPerPageText: 'Data per halaman',
                            itemsPerPageOptions: [5,10,15,20,50,100]
                        }"
                    >

                        <template v-slot:body="{ items }">
                            <tbody v-if="items.length > 0">
                                <tr
                                    v-for="(item, index) in items"
                                    :key="item.name"
                                >
                                    <td>{{ getNumberRows(index) }}</td>
                                    <td>{{ item.fullname ? item.fullname : 'Tidak Diketahui' }}</td>
                                    <td>
                                        {{`
                                            ${item.birthplace ? item.birthplace : 'Tidak Diketahui'}, 
                                            ${item.birthdate ? formatDate(item.birthdate) : 'Tidak Diketahui'}
                                        ` }}
                                    </td>
                                </tr>
                            </tbody>
                            <tbody v-else>
                                <tr>
                                <td :colspan="headers.length" style="text-align: center">Tidak ada Data</td>
                                </tr>
                            </tbody>
                        </template>

                    </v-data-table>
                    <v-card-text class="text-center pt-0">
                        <v-row class="d-flex justify-center">
                            <v-col
                                cols="7"
                                sm="6"
                                md="5"
                                lg="4"
                            >
                                <v-pagination
                                    v-model="page"
                                    :disabled="loadingTable"
                                    :length="totalPage"
                                    circle
                                />
                            </v-col>
                        </v-row>
                    </v-card-text>
                </v-card>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
const SEARCH_DEBOUNCE_MS = 500;

import debounce from 'lodash/debounce';

export default {
    data: () => ({
        page: 1,
        totalPage: 1,
        totalTableItems: 0,
        tableItems: [],
        loadingTable: true,
        options: {
            page: 1,
            rowsPerPage: 10,
            sortBy: [],
            sortDesc: []
        },
        headers: [
            { text: 'No', align: 'start', value: 'index', sortable: false },
            { text: 'Name', align: 'start', value: 'fullname', sortable: false },
            { text: 'Birthday', value: 'birth_date_place', sortable: false },
        ],
        search: null
    }),
    watch: {
        options: {
            handler () {
                this.loadingTable = true;
                this.getDataFromApi();
            },
            deep: true
        },
        search () {
            this.loadingTable = true;
            this.getDataFromApi();
        }
    },
    
    async mounted () {
        await Promise.all([
            this.getDataFromApi()
        ]);
    },
    methods: {
        formatDate (s) {
            const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'Octtober', 'November', 'December'];
            s = s.replace(/-/g, '/');
            const d = new Date(s);

            return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
        },
        getNumberRows (index){
            return ((this.page-1) * this.options.itemsPerPage) + index + 1;
        },
        getDataFromApi: debounce (async function () {
            const { page, itemsPerPage } = this.options;

            try {
                this.loadingTable = true;
                const result = await this.$axios.post('https://api-hangman.jpcc.my.id/api/user/filtered', {
                    paginate: itemsPerPage,
                    page: page,
                    search: this.search
                });

                this.tableItems = result.data && result.data.data;
                this.totalTableItems = result.data && result.data.total;
                this.totalPage = result.data && result.data.last_page;
                this.page = result.data && result.data.current_page;
            } catch (error) {
                console.error(error);
            } finally {
                this.loadingTable = false;
            }
        }, SEARCH_DEBOUNCE_MS)
    }
};
</script>
